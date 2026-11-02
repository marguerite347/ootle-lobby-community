import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import express from "express";
import { PGlite } from "@electric-sql/pglite";
import { createChatStore, installSchema } from "../creator-hub/hub/server/community/store.mjs";
import { createCommunityRouter } from "../creator-hub/hub/server/community/router.mjs";
import { createForumBridge, forumBridgeConfig, forumPost, FORUM_ORIGIN } from "../creator-hub/hub/server/community/forumBridge.mjs";

const config = { incomingUrl: `${FORUM_ORIGIN}/chat/hooks/test-only`, secret: "test-secret-".repeat(4), cronSecret: "test-cron-".repeat(4), startsAt: "2026-01-01T00:00:00Z" };
const post = (id = 50, overrides = {}) => ({
  message: { id, message: "Hello from the Forum", user: { username: "ForumBuilder" }, chat_channel_id: 2, created_at: new Date().toISOString(), ...overrides },
  channel: { id: 2, chatable_type: "Category", chatable_id: 4, chatable: { read_restricted: false } },
});
function signed(payload, eventId = 1, event = "chat_message_created") {
  const raw = Buffer.from(JSON.stringify(payload));
  return [raw, { "x-discourse-event-signature": "sha256=" + createHmac("sha256", config.secret).update(raw).digest("hex"), "x-discourse-instance": FORUM_ORIGIN, "x-discourse-event-id": String(eventId), "x-discourse-event": event }];
}
async function fixture(t, fetcher = async () => Response.json({ success: "OK" })) {
  const db = new PGlite();
  t.after(() => db.close());
  await installSchema(db);
  await db.query("UPDATE community_chat.channels SET connected=true,can_post=true WHERE id='forum-general'");
  const bridge = createForumBridge(db, config, { fetcher });
  const store = createChatStore(db, { forumBridge: bridge });
  await store.login({ id: 1, login: "Guest Display Name" }, { ownerId: "1" });
  await store.login({ id: 2, login: "Member" }, { allowedIds: ["2"] });
  return { db, bridge, store };
}

test("Forum bridge is opt-in and secrets cannot target another host", () => {
  assert.equal(forumBridgeConfig({}), null);
  const env = { CHAT_FORUM_ENABLED: "1", CHAT_FORUM_INCOMING_URL: config.incomingUrl, CHAT_FORUM_WEBHOOK_SECRET: config.secret, CRON_SECRET: config.cronSecret, CHAT_FORUM_STARTS_AT: config.startsAt };
  assert.equal(forumBridgeConfig(env).incomingUrl, config.incomingUrl);
  for (const url of ["https://evil.test/chat/hooks/key", "http://community.tari.com/chat/hooks/key", `${config.incomingUrl}?secret=x`, "https://user:password@community.tari.com/chat/hooks/key"])
    assert.throws(() => forumBridgeConfig({ ...env, CHAT_FORUM_INCOMING_URL: url }));
  assert.throws(() => forumBridgeConfig({ ...env, CHAT_FORUM_WEBHOOK_SECRET: "short" }));
});

test("two-way public message trial: attribution, atomic outbox, retry deduplication and echo receipts", async t => {
  const sent = [];
  const { db, bridge, store } = await fixture(t, async (url, options) => { sent.push({ url, ...JSON.parse(options.body) }); return Response.json({ success: "OK" }); });
  const input = { channelId: "lobby", body: "Hi @all <script>hello</script>", clientId: "bridge-message-001" };
  const local = await store.send("github-2", input);
  assert.equal((await store.send("github-2", input)).id, local.id);
  assert.equal((await db.query("SELECT * FROM community_chat.deliveries")).rows.length, 1);
  await Promise.all([bridge.flush(), bridge.flush()]);
  assert.equal(sent.length, 1);
  assert.match(sent[0].text, /Member · From Lobby/);
  assert.ok(!sent[0].text.includes("@all"));
  assert.ok(!sent[0].text.includes("<script>"));
  const receipt = signed(post(70, { message: forumPost(local), chat_webhook_event: { username: "Tari Lobby" } }), 5);
  await bridge.receive(...receipt);
  await bridge.receive(...receipt);
  const deliveries = (await db.query("SELECT * FROM community_chat.deliveries")).rows;
  assert.equal(deliveries[0].status, "delivered");
  assert.equal(deliveries[0].remote_id, "70");
  assert.equal((await store.messages("github-2", "lobby")).length, 1);
  const remote = signed(post(71, { in_reply_to: { id: 70 } }), 6);
  await bridge.receive(...remote);
  await bridge.receive(...remote);
  const messages = await store.messages("github-2", "lobby");
  const imported = messages.find(m => m.platform === "forum");
  assert.equal(imported.author_name, "ForumBuilder");
  assert.equal(imported.account_id, null);
  assert.equal(imported.parent_id, local.id);
  assert.equal(imported.origin_url, `${FORUM_ORIGIN}/chat/c/general/2/71`);
  assert.equal((await db.query("SELECT * FROM community_chat.deliveries")).rows.length, 1);
  assert.equal((await store.send("github-2", input)).id, local.id);
  await store.send("github-2", { ...input, channelId: "builders", clientId: "bridge-builders-001" });
  assert.equal((await db.query("SELECT * FROM community_chat.deliveries")).rows.length, 1);
});

test("invalid signatures, DMs, restricted categories, other channels and old history never import", async t => {
  const { bridge, store, db } = await fixture(t);
  const [raw, headers] = signed(post());
  await assert.rejects(() => bridge.receive(raw, { ...headers, "x-discourse-event-signature": "sha256=" + "0".repeat(64) }), { status: 401 });
  await assert.rejects(() => bridge.receive(raw, { ...headers, "x-discourse-instance": "https://evil.test" }), { status: 403 });
  const variants = [post(), post(), post(), post(90, { created_at: "2025-01-01T00:00:00Z" })];
  variants[0].channel.chatable_type = "DirectMessage";
  variants[1].channel.chatable.read_restricted = true;
  variants[2].channel.id = 3;
  for (const payload of variants) assert.equal((await bridge.receive(...signed(payload))).ignored, true);
  assert.equal((await store.messages("github-2", "lobby")).length, 0);
  await db.query("UPDATE community_chat.channels SET visibility='restricted' WHERE id='lobby'");
  assert.equal(await bridge.status(), null);
  await assert.rejects(() => bridge.receive(...signed(post())), { status: 503 });
});

test("edits, deletion, restore and out-of-order events preserve local moderation", async t => {
  const { bridge, store } = await fixture(t);
  const original = post();
  await bridge.receive(...signed(original, 10));
  const id = (await store.messages("github-2", "lobby"))[0].id;
  await bridge.receive(...signed(post(50, { message: "Updated" }), 12, "chat_message_edited"));
  await bridge.receive(...signed(original, 11));
  assert.equal((await store.messages("github-2", "lobby"))[0].body, "Updated");
  await bridge.receive(...signed(post(50, { deleted_at: new Date().toISOString() }), 13, "chat_message_trashed"));
  assert.equal((await store.messages("github-2", "lobby")).length, 0);
  await bridge.receive(...signed(original, 14, "chat_message_restored"));
  assert.equal((await store.messages("github-2", "lobby"))[0].id, id);
  await store.moderate("github-1", id, "hide");
  await bridge.receive(...signed(original, 15, "chat_message_restored"));
  assert.equal((await store.messages("github-2", "lobby")).length, 0);
});

test("ambiguous sends never automatically retry; rate limits queue; receipts recover a timeout", async t => {
  let mode = "timeout", attempts = 0;
  const { bridge, store, db } = await fixture(t, async () => {
    attempts++;
    if (mode === "timeout") throw new Error("A timeout after sending");
    return new Response("", { status: mode === "rate" ? 429 : 403 });
  });
  const local = await store.send("github-2", { channelId: "lobby", body: "One copy", clientId: "bridge-timeout-001" });
  await bridge.flush(); await bridge.flush();
  assert.equal(attempts, 1);
  assert.equal((await db.query("SELECT status FROM community_chat.deliveries")).rows[0].status, "uncertain");
  await bridge.receive(...signed(post(91, { message: forumPost(local), chat_webhook_event: { username: "Tari Lobby" } }), 20));
  assert.equal((await db.query("SELECT status FROM community_chat.deliveries")).rows[0].status, "delivered");
  mode = "rate";
  await store.send("github-2", { channelId: "lobby", body: "Queued", clientId: "bridge-rate-0001" });
  await bridge.flush(); await bridge.flush();
  assert.equal(attempts, 2);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM community_chat.deliveries WHERE status='queued'")).rows[0].n, 1);
  mode = "forbidden";
  await db.query("UPDATE community_chat.deliveries SET next_attempt_at=now()-interval '1 second' WHERE status='queued'");
  await bridge.flush();
  assert.equal((await db.query("SELECT count(*)::int AS n FROM community_chat.deliveries WHERE status='failed'")).rows[0].n, 1);
});

test("HTTP webhook and scheduler have distinct authentication; normal mutations retain CSRF protection", async t => {
  const { bridge, store } = await fixture(t);
  const app = express();
  app.use("/api/chat", createCommunityRouter({ store, forumBridge: bridge, origin: "https://lobby.tari.com", guests: { secret: "test" } }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}/api/chat`;
  const [raw, headers] = signed(post());
  assert.equal((await fetch(base + "/forum/webhook", { method: "POST", headers: { ...headers, "content-type": "application/json" }, body: raw })).status, 200);
  assert.equal((await fetch(base + "/forum/webhook", { method: "POST", headers: { "content-type": "application/json" }, body: raw })).status, 401);
  assert.equal((await fetch(base + "/forum/flush")).status, 401);
  assert.equal((await fetch(base + "/forum/flush", { headers: { authorization: `Bearer ${config.cronSecret}` } })).status, 200);
  assert.equal((await fetch(base + "/messages", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status, 403);
  assert.equal((await (await fetch(base + "/capabilities")).json()).forumBridge.channelId, "lobby");
});
