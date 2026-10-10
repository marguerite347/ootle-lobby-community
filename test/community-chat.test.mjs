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
  const unreported = await store.send("github-1", {
    channelId: "lobby",
    body: "Direct moderation must still be reversible.",
    clientId: "direct-moderation-001",
  });
  await store.moderate("github-1", unreported.id, "hide");
  assert.ok(
    (await store.reports("github-1")).some(
      (r) => r.message_id === unreported.id,
    ),
  );
  await store.moderate("github-1", unreported.id, "restore");
  assert.ok(
    !(await store.reports("github-1")).some(
      (r) => r.message_id === unreported.id,
    ),
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
  for (const [returnTo, expected] of [
    ["lobby", "/?chat=open"],
    ["https://example.com", "/chat"],
  ]) {
    const startAgain = await fetch(
      base + "/api/chat/auth/start?returnTo=" + encodeURIComponent(returnTo),
      { redirect: "manual" },
    );
    const nextState = new URL(
      startAgain.headers.get("location"),
    ).searchParams.get("state");
    const nextCookies = startAgain.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
    const returned = await fetch(
      base + "/api/chat/auth/callback?state=" + nextState + "&code=test",
      { headers: { Cookie: nextCookies }, redirect: "manual" },
    );
    assert.equal(returned.headers.get("location"), expected);
    assert.ok(
      returned.headers
        .getSetCookie()
        .some(
          (value) =>
            value.startsWith("ootle_chat_return=;") &&
            value.includes("Expires="),
        ),
    );
  }
});

test("name-only guests exchange messages with separate durable sessions and member permissions", async (t) => {
  const db = new PGlite();
  await installSchema(db);
  const store = createChatStore(db);
  const app = express(), server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = "http://127.0.0.1:" + server.address().port;
  app.use("/api/chat", createCommunityRouter({ store, origin: base, guests: { secret: "test-guest-secret" } }));
  app.use("/closed", createCommunityRouter({ store, origin: base }));
  t.after(async () => { server.closeAllConnections(); server.close(); await db.close(); });
  const headers = { Origin: base, "X-Ootle-Chat": "1", "Content-Type": "application/json" };
  const join = (name, extra = {}) => fetch(base + "/api/chat/guest/session", {
    method: "POST", headers: { ...headers, ...extra },
    body: JSON.stringify({ name, role: "owner", accountId: "github-1" }),
  });
  assert.equal((await (await fetch(base + "/api/chat/capabilities")).json()).guests, true);
  assert.equal((await (await fetch(base + "/closed/capabilities")).json()).guests, false);
  assert.equal((await fetch(base + "/closed/guest/session", { method: "POST", headers, body: '{"name":"Closed"}' })).status, 401);
  assert.equal((await join("Alice", { Origin: "https://other.example" })).status, 403);
  assert.equal((await join("Alice", { "X-Ootle-Chat": "" })).status, 403);
  assert.equal((await join("  ")).status, 400);
  assert.equal((await join("a".repeat(41))).status, 400);
  const a = await join("QA Alice"), b = await join("QA Blake");
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  const alice = (await a.json()).account, blake = (await b.json()).account;
  assert.notEqual(alice.id, blake.id);
  assert.match(alice.id, /^guest-/);
  assert.equal(alice.role, "member");
  assert.equal(blake.role, "member");
  const cookieA = a.headers.get("set-cookie").split(";")[0];
  const cookieB = b.headers.get("set-cookie").split(";")[0];
  assert.match(a.headers.get("set-cookie"), /HttpOnly/);
  assert.match(a.headers.get("set-cookie"), /Secure/);
  assert.match(a.headers.get("set-cookie"), /SameSite=Lax/);
  assert.equal((await (await join("Changed", { Cookie: cookieA })).json()).account.id, alice.id);
  assert.equal((await (await fetch(base + "/api/chat/session", { headers: { Cookie: cookieA } })).json()).account.name, "QA Alice");
  const post = (cookie, body) => fetch(base + "/api/chat/messages", {
    method: "POST", headers: { ...headers, Cookie: cookie },
    body: JSON.stringify({ channelId: "lobby", body, clientId: body.replaceAll(" ", "-"), accountId: alice.id }),
  });
  assert.equal((await post(cookieA, "Hello from Alice")).status, 201);
  const reply = await post(cookieB, "Hello from Blake");
  assert.equal(reply.status, 201);
  assert.equal((await reply.json()).message.account_id, blake.id);
  for (const cookie of [cookieA, cookieB]) {
    const messages = await (await fetch(base + "/api/chat/channels/lobby/messages", { headers: { Cookie: cookie } })).json();
    assert.deepEqual(messages.messages.map(m => m.author_name), ["QA Alice", "QA Blake"]);
    assert.equal((await fetch(base + "/api/chat/moderation", { headers: { Cookie: cookie } })).status, 403);
  }
  await db.query("INSERT INTO community_chat.channels(id,name,description,visibility) VALUES('staff','staff','Staff only','restricted')");
  assert.equal((await fetch(base + "/api/chat/channels/staff/messages", { headers: { Cookie: cookieA } })).status, 404);
  const sessions = (await db.query("SELECT digest FROM community_chat.sessions")).rows;
  assert.ok(sessions.every(row => row.digest !== cookieA.split("=")[1]));
  // The IP quota persists across router instances; invalid joins also consume attempts.
  for (let i = 0; i < 6; i++) assert.equal((await join("Tester " + i)).status, 200);
  assert.equal((await join("Too many")).status, 429);
  assert.equal((await (await join("Existing guest", { Cookie: cookieA })).json()).account.id, alice.id);
  await db.query("UPDATE community_chat.sessions SET expires_at=now()-interval '1 second' WHERE account_id=$1", [alice.id]);
  assert.equal((await (await fetch(base + "/api/chat/session", { headers: { Cookie: cookieA } })).json()).account, null);
  await fetch(base + "/api/chat/logout", { method: "POST", headers: { ...headers, Cookie: cookieB }, body: "{}" });
  assert.equal((await (await fetch(base + "/api/chat/session", { headers: { Cookie: cookieB } })).json()).account, null);
});

test("automatic guests can customize or regenerate names without changing identity or message history", async (t) => {
  const db = new PGlite();
  await installSchema(db);
  const store = createChatStore(db);
  const app = express(), server = app.listen(0, "127.0.0.1");
  await new Promise(r => server.once("listening", r));
  const base = "http://127.0.0.1:" + server.address().port;
  app.use("/api/chat", createCommunityRouter({ store, origin: base, guests: { secret: "auto-guests-test" } }));
  t.after(async () => { server.closeAllConnections(); server.close(); await db.close(); });
  const headers = { Origin: base, "X-Ootle-Chat": "1", "Content-Type": "application/json" };
  const post = (path, body, extra = {}) => fetch(base + "/api/chat" + path, {
    method: "POST", headers: { ...headers, ...extra }, body: JSON.stringify(body),
  });
  const joined = await post("/guest/session", {});
  assert.equal(joined.status, 200);
  const original = (await joined.json()).account;
  assert.match(original.name, /^[A-Z][a-z]+ [A-Z][a-z]+ [1-9][0-9]{3}$/);
  const cookie = { Cookie: joined.headers.get("set-cookie").split(";")[0] };
  const other = await store.createGuest(undefined, "a".repeat(64));
  assert.notEqual(other.id, original.id);
  assert.equal((await (await post("/guest/session", {}, cookie)).json()).account.id, original.id);
  const before = await post("/messages", { channelId: "lobby", body: "Before rename", clientId: "before-rename" }, cookie);
  assert.equal((await before.json()).message.author_name, original.name);
  assert.equal((await post("/profile/name", { name: "No session" })).status, 401);
  assert.equal((await post("/profile/name", { name: "Wrong origin" }, { ...cookie, Origin: "https://other.example" })).status, 403);
  assert.equal((await post("/profile/name", { name: " " }, cookie)).status, 400);
  assert.equal((await post("/profile/name", { name: "x".repeat(41) }, cookie)).status, 400);
  const renamed = await post("/profile/name", { name: "  Custom  Guest  ", accountId: other.id, role: "owner" }, cookie);
  assert.deepEqual((await renamed.json()).account, { ...original, name: "Custom Guest" });
  assert.equal((await store.account(other.id)).name, other.name);
  const after = await post("/messages", { channelId: "lobby", body: "After rename", clientId: "after-rename" }, cookie);
  assert.equal((await after.json()).message.author_name, "Custom Guest");
  assert.equal((await store.messages(original.id, "lobby"))[0].author_name, original.name);
  const random = (await (await post("/profile/name", { randomize: true }, cookie)).json()).account;
  assert.match(random.name, /^[A-Z][a-z]+ [A-Z][a-z]+ [1-9][0-9]{3}$/);
  assert.equal(random.id, original.id);
  assert.equal(random.role, "member");
  const current = await (await fetch(base + "/api/chat/session", { headers: cookie })).json();
  assert.equal(current.account.name, random.name);
  assert.equal((await db.query("SELECT quota_count FROM community_chat.accounts WHERE id=$1", [original.id])).rows[0].quota_count, 2);
  await db.query("UPDATE community_chat.accounts SET blocked=true WHERE id=$1", [original.id]);
  assert.equal((await post("/profile/name", { name: "Blocked" }, cookie)).status, 401);
});

test("shared invitations create separate identities, expire, and cannot be replayed or escalate roles", async (t) => {
  const db = new PGlite();
  await installSchema(db);
  const store = createChatStore(db);
  const app = express(), server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = "http://127.0.0.1:" + server.address().port;
  app.use("/api/chat", createCommunityRouter({store, origin: base, invites: {secret: "test-invite-secret"}}));
  t.after(async () => { server.closeAllConnections(); server.close(); await db.close(); });
  for (const [token, role] of [["1".repeat(64), "owner"], ["2".repeat(64), "member"], ["3".repeat(64), "member"]])
    await store.createInvitation({token, name: "Tester", role, expiresAt: new Date(Date.now()+86400000).toISOString()});
  const join = (token, name, headers = {}) => fetch(base+"/api/chat/invitations/redeem", {method:"POST", headers:{"Content-Type":"application/json", "Origin":base, "X-Ootle-Chat":"1", ...headers}, body:JSON.stringify({token,name,role:"owner",accountId:"forged"})});
  assert.equal((await join("1".repeat(64), "A", {Origin:"https://other.example"})).status,403);
  assert.equal((await join("1".repeat(64), "")).status,400);
  const owner = await join("1".repeat(64), "Test owner");
  const ownerAccount = (await owner.json()).account;
  assert.equal(ownerAccount.role,"owner");
  assert.match(owner.headers.get("set-cookie"), /HttpOnly/);
  assert.match(owner.headers.get("set-cookie"), /Secure/);
  const cookieA=owner.headers.get("set-cookie").split(";")[0];
  assert.equal((await join("1".repeat(64), "Replay")).status,401);
  const concurrent = await Promise.all([join("2".repeat(64), "Tester B"), join("2".repeat(64), "Tester B")]);
  assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,401]);
  const member = concurrent.find(r=>r.status===200);
  const memberAccount=(await member.json()).account;
  assert.equal(memberAccount.role,"member");
  assert.notEqual(memberAccount.id,ownerAccount.id);
  const cookieB=member.headers.get("set-cookie").split(";")[0];
  const post = (cookie, body) => fetch(base+"/api/chat/messages", {method:"POST", headers:{Origin:base,"X-Ootle-Chat":"1","Content-Type":"application/json",Cookie:cookie},body:JSON.stringify({channelId:"lobby",body,clientId:body.replaceAll(" ", "-"),accountId:ownerAccount.id})});
  const sentA=await post(cookieA,"Owner test message");
  assert.equal(sentA.status,201);
  const sentB=await post(cookieB,"Member test message");
  assert.equal(sentB.status,201);
  assert.equal((await sentB.json()).message.account_id,memberAccount.id);
  for (const cookie of [cookieA,cookieB]) {
    const response=await fetch(base+"/api/chat/channels/lobby/messages",{headers:{Cookie:cookie}});
    assert.equal((await response.json()).messages.length,2);
  }
  assert.equal((await fetch(base+"/api/chat/channels/lobby/messages")).status,401);
  await db.query("UPDATE community_chat.invitations SET expires_at=now()-interval '1 day' WHERE redeemed_at IS NULL");
  assert.equal((await join("3".repeat(64),"Expired")).status,401);
  const invitations=(await db.query("SELECT digest FROM community_chat.invitations")).rows;
  assert.ok(invitations.every(r=>!["1".repeat(64),"2".repeat(64)].includes(r.digest)));
});
