import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
} from "nostr-tools/pure";
import { createRumor, createSeal, createWrap } from "nostr-tools/nip59";
import {
  createChatStore,
  installSchema,
} from "../creator-hub/hub/server/community/store.mjs";
import {
  messageEnvelopes,
  openMessage,
} from "../creator-hub/hub/shared/privateMessages.mjs";
import { createCommunityRouter } from "../creator-hub/hub/server/community/router.mjs";
import express from "express";

const origin = "http://localhost:4322";
async function setup(t) {
  const db = new PGlite();
  t.after(() => db.close());
  await installSchema(db);
  const store = createChatStore(db),
    keys = {};
  for (const id of [1, 2, 3]) {
    await store.login({ id, login: "same-name" }, { allowedIds: [String(id)] });
    await store.send("github-" + id, {
      channelId: "lobby",
      body: "synthetic participant " + id,
      clientId: "intro-participant-" + id,
    });
    keys[id] = generateSecretKey();
  }
  async function bind(id, key = keys[id]) {
    const challenge = await store.privateChat.challenge(
      "github-" + id,
      getPublicKey(key),
      origin,
    );
    const event = finalizeEvent(
      { ...challenge, created_at: Math.floor(Date.now() / 1000) },
      key,
    );
    await store.privateChat.bind("github-" + id, event, origin);
    return event;
  }
  return { db, store, keys, bind };
}
test("private key proofs cannot cross sessions, replay, rotate silently, or share a key", async (t) => {
  const { store, keys, bind, db } = await setup(t),
    p = store.privateChat;
  const proof = await bind(1);
  await assert.rejects(() => p.bind("github-1", proof, origin), {
    status: 400,
  });
  await assert.rejects(() => p.bind("github-2", proof, origin), {
    status: 400,
  });
  await assert.rejects(
    () => p.challenge("github-1", getPublicKey(keys[2]), origin),
    { status: 409 },
  );
  await assert.rejects(() => bind(2, keys[1]), { status: 409 });
  const c = await p.challenge("github-2", getPublicKey(keys[2]), origin);
  const expired = finalizeEvent(
    { ...c, created_at: Math.floor(Date.now() / 1000) },
    keys[2],
  );
  await db.query(
    "UPDATE community_chat.private_challenges SET expires_at=now()-interval '1 second'",
  );
  await assert.rejects(() => p.bind("github-2", expired, origin), {
    status: 400,
  });
});
test("private contacts require consent; ciphertext survives reconnect; blocked and unrelated guests cannot read/send", async (t) => {
  const { store, keys, bind, db } = await setup(t),
    p = store.privateChat;
  await bind(1);
  await bind(2);
  await bind(3);
  const c = await p.request("github-1", "github-2");
  assert.equal((await p.request("github-2", "github-1")).id, c.id);
  assert.equal((await p.overview("github-2")).contacts[0].state, "pending");
  await assert.rejects(() => p.respond("github-1", c.id, "accept"), {
    status: 403,
  });
  const id = randomUUID(),
    body = "PRIVATE synthetic test <not HTML>",
    wraps = messageEnvelopes(keys[1], getPublicKey(keys[2]), c.id, id, body);
  await assert.rejects(() => p.send("github-1", c.id, { id, ...wraps }), {
    status: 409,
  });
  await p.respond("github-2", c.id, "accept");
  await p.send("github-1", c.id, { id, ...wraps });
  await p.send("github-1", c.id, { id, ...wraps });
  await assert.rejects(() => p.send("github-1", c.id, { id, ...wraps, body }), {
    status: 400,
  });
  await assert.rejects(() => p.messages("github-3", c.id), { status: 404 });
  const received = (
    await createChatStore(db).privateChat.messages("github-2", c.id)
  ).messages;
  assert.equal(received.length, 1);
  assert.equal(
    openMessage(keys[2], received[0].envelope, {
      sender: getPublicKey(keys[1]),
      recipient: getPublicKey(keys[2]),
      conversation: c.id,
      id,
    }),
    body,
  );
  assert.equal(
    openMessage(
      keys[1],
      (await p.messages("github-1", c.id)).messages[0].envelope,
      {
        sender: getPublicKey(keys[1]),
        recipient: getPublicKey(keys[2]),
        conversation: c.id,
        id,
      },
    ),
    body,
  );
  assert.ok(
    !JSON.stringify(
      (await db.query("SELECT * FROM community_chat.private_messages")).rows,
    ).includes(body),
  );
  assert.ok(
    !(await store.messages("github-2", "lobby")).some((m) => m.body === body),
  );
  await p.received("github-1", c.id, id);
  assert.equal(
    (await p.messages("github-1", c.id)).messages[0].received_at,
    null,
  );
  await p.received("github-2", c.id, id);
  assert.ok((await p.messages("github-1", c.id)).messages[0].received_at);
  await p.respond("github-2", c.id, "block");
  await p.respond("github-1", c.id, "block"); // cannot take ownership of the other's block
  await assert.rejects(() => p.respond("github-1", c.id, "unblock"), {
    status: 403,
  });
  await assert.rejects(() => p.messages("github-1", c.id), { status: 409 });
  await assert.rejects(
    () => p.send("github-1", c.id, { id: randomUUID(), ...wraps }),
    { status: 409 },
  );
  await p.respond("github-2", c.id, "unblock");
  await assert.rejects(() => p.request("github-1", "github-2"), {
    status: 409,
  });
  await p.respond("github-2", c.id, "accept");
  assert.equal((await p.messages("github-2", c.id)).messages.length, 1);
  await p.respond("github-1", c.id, "decline");
  await assert.rejects(() => p.respond("github-2", c.id, "accept"), {
    status: 403,
  });
  await p.respond("github-1", c.id, "accept");
});
test("cryptography rejects tampering, a wrong recipient, conversation substitution, and forged inner authors", () => {
  const a = generateSecretKey(),
    b = generateSecretKey(),
    c = generateSecretKey(),
    id = randomUUID(),
    conversation = randomUUID();
  const expect = {
    sender: getPublicKey(a),
    recipient: getPublicKey(b),
    conversation,
    id,
  };
  const { recipientWrap } = messageEnvelopes(
    a,
    getPublicKey(b),
    conversation,
    id,
    "Private test",
  );
  assert.equal(openMessage(b, recipientWrap, expect), "Private test");
  assert.throws(() => openMessage(c, recipientWrap, expect));
  assert.throws(() =>
    openMessage(
      b,
      { ...recipientWrap, content: recipientWrap.content.slice(0, -2) + "AA" },
      expect,
    ),
  );
  assert.throws(() =>
    openMessage(b, recipientWrap, { ...expect, conversation: randomUUID() }),
  );
  const rumor = createRumor(
    {
      kind: 14,
      created_at: Math.floor(Date.now() / 1000),
      content: "Forged",
      tags: [
        ["p", getPublicKey(b)],
        ["ootle-dm", conversation, id],
      ],
    },
    a,
  );
  const forged = createWrap(
    createSeal(rumor, c, getPublicKey(b)),
    getPublicKey(b),
  );
  assert.throws(() => openMessage(b, forged, expect));
  const seal = createSeal(rumor, a, getPublicKey(b));
  seal.sig = "0".repeat(128);
  assert.throws(() =>
    openMessage(b, createWrap(seal, getPublicKey(b)), expect),
  );
});
test("private HTTP routes are closed by switch, exact origin, and active session", async (t) => {
  const { store } = await setup(t);
  const app = express();
  app.use("/off", createCommunityRouter({ store, origin, preview: true }));
  app.use(
    "/api/chat",
    createCommunityRouter({
      store,
      origin,
      preview: true,
      privateEnabled: true,
    }),
  );
  const server = app.listen(0, "127.0.0.1");
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  await new Promise((r) => server.once("listening", r));
  const base = "http://127.0.0.1:" + server.address().port;
  const token = "b".repeat(64);
  await store.createSession("github-1", token);
  const headers = {
    cookie: "ootle_chat_session=" + token,
    "content-type": "application/json",
    "x-ootle-chat": "1",
    origin,
  };
  assert.equal(
    (await fetch(base + "/off/private/overview", { headers })).status,
    503,
  );
  assert.equal((await fetch(base + "/api/chat/private/overview")).status, 401);
  assert.equal(
    (
      await fetch(base + "/api/chat/private/challenge", {
        method: "POST",
        headers: { ...headers, origin: "https://evil.example" },
        body: "{}",
      })
    ).status,
    403,
  );
  assert.equal(
    (await fetch(base + "/api/chat/private/overview", { headers })).status,
    200,
  );
});
