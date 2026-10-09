import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import {
  createChatStore,
  installSchema,
} from "../creator-hub/hub/server/community/store.mjs";
import { createCommunityRouter } from "../creator-hub/hub/server/community/router.mjs";
import express from "express";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { communityDatabaseOptions } from "../creator-hub/hub/server/community/database.mjs";
import { Client } from "pg";
test("hosted database TLS cannot be weakened by connection URL parameters", () => {
  for (const suffix of [
    "sslmode=disable",
    "sslmode=no-verify",
    "ssl=false",
    "sslmode=require&uselibpqcompat=true",
  ]) {
    const config = communityDatabaseOptions({
      CHAT_DATABASE_URL: "postgres://chat:example@localhost/chat?" + suffix,
    });
    const client = new Client(config);
    assert.equal(client.connectionParameters.ssl.rejectUnauthorized, true);
  }
  const config = communityDatabaseOptions({
    CHAT_DATABASE_URL: "postgres://localhost/chat",
    CHAT_DATABASE_CA: "test-ca",
  });
  assert.equal(new Client(config).connectionParameters.ssl.ca, "test-ca");
});
test("durable chat trial: identity, isolation, replies and retry-safe sends", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await installSchema(db);
  const store = createChatStore(db);
  await store.login({ id: 1, login: "owner" }, { ownerId: "1" });
  await store.login({ id: 2, login: "builder" }, { allowedIds: ["2"] });
  await assert.rejects(() => store.login({ id: 3, login: "uninvited" }), {
    status: 403,
  });
  await db.query(
    "INSERT INTO community_chat.channels(id,name,description,visibility,connected,can_post) VALUES('private','staff','Staff only','restricted',true,true)",
  );
  await db.query(
    "INSERT INTO community_chat.channel_members VALUES('private','github-1')",
  );
  assert.ok(
    !(await store.channels("github-2")).some((c) => c.id === "private"),
  );
  await assert.rejects(() => store.messages("github-2", "private"), {
    status: 404,
  });
  const input = {
    channelId: "lobby",
    body: "A real persisted message.",
    clientId: "trial-message-001",
  };
  const saved = await store.send("github-2", input);
  assert.equal((await store.send("github-2", input)).id, saved.id);
  await assert.rejects(
    () => store.send("github-2", { ...input, body: "Different payload" }),
    { status: 409 },
  );
  await store.send("github-1", {
    channelId: "lobby",
    body: "A reply",
    parentId: saved.id,
    clientId: "trial-reply-0001",
  });
  await assert.rejects(
    () =>
      store.send("github-2", {
        channelId: "builders",
        body: "Cross-channel reply",
        parentId: saved.id,
        clientId: "trial-reply-0002",
      }),
    { status: 409 },
  );
  const reopened = createChatStore(db);
  assert.equal((await reopened.messages("github-2", "lobby")).length, 2);
  assert.equal(
    (await reopened.messages("github-2", "lobby"))[0].reply_count,
    1,
  );
  await assert.rejects(() => store.moderate("github-2", saved.id, "hide"), {
    status: 403,
  });
  await store.report("github-2", saved.id, "Example report");
  await store.report("github-2", saved.id, "Duplicate report");
  assert.equal((await store.reports("github-1")).length, 1);
  await store.moderate("github-1", saved.id, "hide");
  assert.equal((await store.messages("github-2", "lobby")).length, 1);
  await store.moderate("github-1", saved.id, "restore");
  assert.equal((await store.messages("github-2", "lobby")).length, 2);
  assert.equal(
    (await db.query("SELECT count(*)::int AS total FROM community_chat.audit"))
      .rows[0].total,
    2,
  );
  const token = "a".repeat(64);
  await store.createSession("github-2", token);
  assert.equal((await store.session(token)).id, "github-2");
  await db.query(
    "UPDATE community_chat.accounts SET blocked=true WHERE id='github-2'",
  );
  assert.equal(await store.session(token), null);
});

test("cross-post plans require permission, confirmation and connected destinations atomically", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await installSchema(db);
  const store = createChatStore(db);
  await store.login({ id: 1, login: "Owner" }, { ownerId: "1" });
  await store.login({ id: 2, login: "Member" }, { allowedIds: ["2"] });
  await db.query(
    "INSERT INTO community_chat.channels(id,name,description,platform,remote_id,connected,can_post) VALUES('discord-builds','builds','Test transport','discord','test-1',true,true),('telegram-news','news','Offline transport','telegram','test-2',false,false)",
  );
  const draft = {
    channelId: "lobby",
    body: "A reviewed announcement",
    clientId: "crosspost-0001",
    destinations: ["discord-builds"],
    confirmed: true,
  };
  await assert.rejects(() => store.send("github-2", draft), { status: 403 });
  await assert.rejects(
    () => store.send("github-1", { ...draft, confirmed: false }),
    { status: 400 },
  );
  await assert.rejects(
    () =>
      store.send("github-1", {
        ...draft,
        destinations: ["discord-builds", "telegram-news"],
      }),
    { status: 409 },
  );
  assert.equal((await store.messages("github-1", "lobby")).length, 0);
  const message = await store.send("github-1", draft);
  await store.send("github-1", draft);
  const deliveries = (
    await db.query(
      "SELECT * FROM community_chat.deliveries WHERE message_id=$1",
      [message.id],
    )
  ).rows;
  assert.equal(deliveries.length, 1);
  assert.equal(deliveries[0].status, "queued");
  await assert.rejects(
    () => store.send("github-1", { ...draft, destinations: [] }),
    { status: 409 },
  );
  await assert.rejects(
    () => store.send("github-1", { ...draft, destinations: {} }),
    { status: 400 },
  );
});

test("shared quota cannot be bypassed through another store instance; browser DB roles see no records", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await installSchema(db);
  const store = createChatStore(db),
    other = createChatStore(db);
  await store.login({ id: 1, login: "Owner" }, { ownerId: "1" });
  for (let i = 0; i < 10; i++)
    await (i % 2 ? store : other).send("github-1", {
      channelId: "lobby",
      body: "Message " + i,
      clientId: "quota-message-" + i,
    });
  await assert.rejects(
    () =>
      other.send("github-1", {
        channelId: "lobby",
        body: "One too many",
        clientId: "quota-message-11",
      }),
    { status: 429 },
  );
  await db.exec(
    "CREATE ROLE chat_browser; GRANT USAGE ON SCHEMA community_chat TO chat_browser; GRANT SELECT ON ALL TABLES IN SCHEMA community_chat TO chat_browser; SET ROLE chat_browser;",
  );
  assert.equal(
    (await db.query("SELECT * FROM community_chat.messages")).rows.length,
    0,
  );
  await db.exec("RESET ROLE");
});

test("chat survives a database restart and retention removes expired messages", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ootle-chat-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  let db = new PGlite(root);
  await installSchema(db);
  let store = createChatStore(db);
  await store.login({ id: 1, login: "Owner" }, { ownerId: "1" });
  await store.send("github-1", {
    channelId: "lobby",
    body: "Keep this through restart",
    clientId: "restart-message-01",
  });
  await db.close();
  db = new PGlite(root);
  store = createChatStore(db);
  try {
    assert.equal(
      (await store.messages("github-1", "lobby"))[0].body,
      "Keep this through restart",
    );
    await db.query(
      "UPDATE community_chat.messages SET created_at=now()-interval '91 days'",
    );
    await store.retention();
    assert.equal((await store.messages("github-1", "lobby")).length, 0);
  } finally {
    await db.close();
  }
});

test("HTTP chat rejects anonymous access, cross-site writes and unconnected cross-posts; logout revokes the session", async (t) => {
  const db = new PGlite();
  await installSchema(db);
  const store = createChatStore(db);
  await store.login({ id: 1, login: "Owner" }, { ownerId: "1" });
  const app = express(),
    server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = "http://127.0.0.1:" + server.address().port;
  app.use(
    "/api/chat",
    createCommunityRouter({ store, origin: base, preview: true }),
  );
  t.after(async () => {
    server.closeAllConnections();
    server.close();
    await db.close();
  });
  assert.equal((await fetch(base + "/api/chat/channels")).status, 401);
  assert.equal(
    (await fetch(base + "/api/chat/preview/session", { method: "POST" }))
      .status,
    403,
  );
  const headers = {
    Origin: base,
    "X-Ootle-Chat": "1",
    "Content-Type": "application/json",
  };
  const signedIn = await fetch(base + "/api/chat/preview/session", {
    method: "POST",
    headers,
    body: "{}",
  });
  assert.equal(signedIn.status, 200);
  const cookie = signedIn.headers.get("set-cookie").split(";")[0];
  assert.match(signedIn.headers.get("set-cookie"), /HttpOnly/);
  assert.match(signedIn.headers.get("set-cookie"), /SameSite=Lax/);
  const authenticated = { ...headers, Cookie: cookie };
  assert.equal(
    (await fetch(base + "/api/chat/channels", { headers: { Cookie: cookie } }))
      .status,
    200,
  );
  const message = {
    channelId: "lobby",
    body: "HTTP test",
    clientId: "http-message-0001",
    name: "forged owner",
    role: "owner",
  };
  const sent = await fetch(base + "/api/chat/messages", {
    method: "POST",
    headers: authenticated,
    body: JSON.stringify(message),
  });
  assert.equal(sent.status, 201);
  assert.equal((await sent.json()).message.author_name, "Owner");
  assert.equal(
    (
      await fetch(base + "/api/chat/messages", {
        method: "POST",
        headers: { ...authenticated, Origin: "https://other.example" },
        body: JSON.stringify(message),
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + "/api/chat/messages", {
        method: "POST",
        headers: authenticated,
        body: JSON.stringify({
          ...message,
          clientId: "http-external-01",
          destinations: ["discord-builds"],
          confirmed: true,
        }),
      })
    ).status,
    409,
  );
  await fetch(base + "/api/chat/logout", {
    method: "POST",
    headers: authenticated,
    body: "{}",
  });
  assert.equal(
    (await fetch(base + "/api/chat/channels", { headers: { Cookie: cookie } }))
      .status,
    401,
  );
});

test("unconfigured chat is closed and never parses a mutation body", async (t) => {
  const app = express();
  app.use("/api/chat", createCommunityRouter());
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const base = "http://127.0.0.1:" + server.address().port;
  assert.equal(
    (await (await fetch(base + "/api/chat/capabilities")).json()).configured,
    false,
  );
  assert.equal(
    (
      await fetch(base + "/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json",
      })
    ).status,
    503,
  );
});

test("OAuth binds the callback to a one-time browser state and PKCE before creating a secure session", async (t) => {
  const db = new PGlite();
  await installSchema(db);
  const store = createChatStore(db),
    calls = [];
  const app = express(),
    server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = "http://127.0.0.1:" + server.address().port;
  const oauth = {
    clientId: "test-client",
    clientSecret: "test-secret",
    ownerId: "1",
  };
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    return new Response(
      JSON.stringify(
        url.endsWith("/user")
          ? { id: 1, login: "Owner" }
          : { access_token: "test-provider-token" },
      ),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  app.use(
    "/api/chat",
    createCommunityRouter({ store, origin: base, oauth, fetcher }),
  );
  t.after(async () => {
    server.closeAllConnections();
    server.close();
    await db.close();
  });
  const start = await fetch(base + "/api/chat/auth/start", {
    redirect: "manual",
  });
  const location = new URL(start.headers.get("location")),
    state = location.searchParams.get("state"),
    cookie = start.headers.get("set-cookie").split(";")[0];
  assert.equal(location.origin, "https://github.com");
  assert.equal(location.searchParams.get("code_challenge_method"), "S256");
  assert.equal(
    (
      await fetch(base + "/api/chat/auth/callback?state=wrong&code=test", {
        headers: { Cookie: cookie },
        redirect: "manual",
      })
    ).status,
    400,
  );
  assert.equal(calls.length, 0);
  const callback =
    base + "/api/chat/auth/callback?state=" + state + "&code=test";
  const accepted = await fetch(callback, {
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  assert.equal(accepted.status, 302);
  assert.equal(accepted.headers.get("location"), "/chat");
  assert.match(accepted.headers.get("set-cookie"), /Secure/);
  assert.match(accepted.headers.get("set-cookie"), /HttpOnly/);
  const tokenRequest = JSON.parse(calls[0].options.body);
  const { createHash } = await import("node:crypto");
  assert.equal(
    createHash("sha256").update(tokenRequest.code_verifier).digest("base64url"),
    location.searchParams.get("code_challenge"),
  );
  assert.equal(
    (await fetch(callback, { headers: { Cookie: cookie }, redirect: "manual" }))
      .status,
    400,
  );
  assert.equal(calls.length, 2);
});
