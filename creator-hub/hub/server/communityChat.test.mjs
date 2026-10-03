import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const dataRoot = mkdtempSync(path.join(tmpdir(), 'hub-community-chat-'));
process.env.CREATOR_HUB_DATA_DIR = dataRoot;
const MODERATOR_TOKEN = 'test-moderator-token-0123456789abcdef';
process.env.COMMUNITY_CHAT_MODERATOR_TOKEN = MODERATOR_TOKEN;

const { createCommunityChat, LIMITS, REJECTIONS, containsLink, looksLikeSecret, cleanBody } = await import(
  './communityChat.mjs'
);
const { createApp } = await import('./app.mjs');

after(() => rmSync(dataRoot, { recursive: true, force: true }));

let storeCounter = 0;
function freshChat(options = {}) {
  storeCounter += 1;
  let clockMs = Date.parse('2026-09-24T12:00:00Z');
  const chat = createCommunityChat({
    dataDir: path.join(dataRoot, `store-${storeCounter}`),
    now: () => clockMs,
    moderatorToken: MODERATOR_TOKEN,
    ...options,
  });
  const advance = (milliseconds) => {
    clockMs += milliseconds;
  };
  return { chat, advance, dataDir: path.join(dataRoot, `store-${storeCounter}`) };
}

const CLIENT_A = 'client-aaaaaaaa';
const CLIENT_B = 'client-bbbbbbbb';
const CLIENT_C = 'client-cccccccc';
const CLIENT_D = 'client-dddddddd';

function post(chat, body, clientId = CLIENT_A, ip = '10.0.0.1', name = 'Ada') {
  return chat.postMessage({ name, body, clientId }, { ip });
}

test('trims, strips control characters and enforces name/body limits', () => {
  const { chat } = freshChat();
  const saved = post(chat, '  gm\u0007 lobby‮  ', CLIENT_A, '10.0.0.1', '  Ada\u0000 \n Lovelace ');
  assert.equal(saved.name, 'Ada Lovelace');
  assert.equal(saved.body, 'gm lobby');

  assert.throws(() => post(chat, 'hi', CLIENT_A, '1', '   '), { status: 400, message: REJECTIONS.nameRequired });
  assert.throws(() => post(chat, 'hi', CLIENT_A, '1', 'n'.repeat(LIMITS.NAME_MAX_LENGTH + 1)), {
    message: REJECTIONS.nameTooLong,
  });
  assert.throws(() => post(chat, ' ​ '), { message: REJECTIONS.bodyRequired });
  assert.throws(() => post(chat, 'b'.repeat(LIMITS.BODY_MAX_LENGTH + 1)), { message: REJECTIONS.bodyTooLong });
  assert.equal(post(chat, 'b '.repeat(250).trim() + 'x', CLIENT_B).body.length, 500);
  assert.throws(() => chat.postMessage({ name: 'Ada', body: 'hi' }), { message: REJECTIONS.clientMissing });
  assert.equal(cleanBody('one\n\n\n\n\ntwo'), 'one\n\ntwo');
});

test('stores and returns plain text without interpreting HTML', () => {
  const { chat, dataDir } = freshChat();
  const markup = '<img src=x onerror=alert(1)> <b>bold</b>';
  const saved = post(chat, markup);
  assert.equal(saved.body, markup);
  const disk = JSON.parse(readFileSync(path.join(dataDir, 'messages.json'), 'utf8'));
  assert.equal(disk.messages[0].body, markup);
  assert.equal(Object.keys(chat.listMessages().messages[0]).sort().join(','), 'at,body,id,name');
  assert.ok(!('clientHash' in chat.listMessages().messages[0]), 'client hashes stay server-side');
});

test('rejects links, domains and obfuscated domains', () => {
  const { chat } = freshChat();
  for (const body of [
    'claim here https://example.test/x',
    'go to www.something',
    'free TARI at tari-airdrop.com',
    'join discord.gg/abc',
    'dm me on t.me/scammer',
    'site is scam[.]xyz',
    'visit scam dot com',
    'mail me at ada@example.org',
  ]) {
    assert.throws(() => post(chat, body), { status: 400, message: REJECTIONS.link }, body);
  }
  assert.throws(() => post(chat, 'hi', CLIENT_A, '1', 'lobby.gg'), { message: REJECTIONS.link });
  for (const body of ['e.g. me and you', 'built it in Node.js and Godot 4.3', 'ok... so']) {
    assert.equal(containsLink(body), false, body);
  }
});

test('rejects private keys and seed phrases', () => {
  const { chat } = freshChat();
  const seedPhrase = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
  for (const body of [
    seedPhrase,
    seedPhrase.toUpperCase(),
    `my words: ${seedPhrase} pls help`,
    '-----BEGIN PRIVATE KEY----- abc',
    `key 0x${'a1b2c3d4'.repeat(8)}`,
    '5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ',
  ]) {
    assert.throws(() => post(chat, body), { status: 400, message: REJECTIONS.secret }, body);
  }
  assert.equal(looksLikeSecret('I think the new level is way better than the old one, nice work'), false);
  assert.equal(looksLikeSecret('hahahahahahahahahahahahahahahahahahahahahahahahaha'), false);
});

test('blocklist rejects slurs and abuse with neutral copy, whole words only', () => {
  const { chat } = freshChat({ blocklist: { terms: ['badword'], phrases: ['go away forever'] } });
  assert.throws(() => post(chat, 'you are a b4dw0rd'), { status: 400, message: REJECTIONS.blocked });
  assert.throws(() => post(chat, 'GO   AWAY, forever!'), { message: REJECTIONS.blocked });
  assert.throws(() => post(chat, 'hi', CLIENT_A, '1', 'Badword'), { message: REJECTIONS.blocked });
  assert.equal(post(chat, 'badwordsmith is not a match').body, 'badwordsmith is not a match');

  const defaults = freshChat().chat;
  assert.throws(() => post(defaults, 'just kys'), { message: REJECTIONS.blocked });
  assert.doesNotThrow(() => post(defaults, 'the raccoon level slaps'));
});

test('rate limits each client, then recovers', () => {
  const { chat, advance } = freshChat();
  for (let index = 0; index < LIMITS.RATE_LIMIT_MESSAGES; index += 1) {
    post(chat, `message ${index}`, CLIENT_A, '10.0.0.1');
    advance(1000);
  }
  assert.throws(() => post(chat, 'one more', CLIENT_A, '10.0.0.9'), (error) => {
    assert.equal(error.status, 429);
    assert.match(error.message, /^Slow down a sec\. Try again in \d+s\.$/);
    return true;
  });
  assert.doesNotThrow(() => post(chat, 'new client, same ip', CLIENT_B, '10.0.0.1'));
  advance(LIMITS.RATE_LIMIT_WINDOW_MS);
  assert.doesNotThrow(() => post(chat, 'back again', CLIENT_A, '10.0.0.1'));
});

test('a single IP is capped across many clients', () => {
  const { chat } = freshChat();
  for (let index = 0; index < LIMITS.IP_RATE_LIMIT_MESSAGES; index += 1) {
    post(chat, `hello ${index}`, `client-ip-test-${index}`, '10.9.9.9');
  }
  assert.throws(() => post(chat, 'one too many', 'client-ip-test-extra', '10.9.9.9'), { status: 429 });
  assert.doesNotThrow(() => post(chat, 'other network', 'client-ip-test-extra', '10.9.9.10'));
});

test('suppresses the same body from the same client within two minutes', () => {
  const { chat, advance } = freshChat();
  post(chat, 'Anyone up for a playtest?');
  advance(5000);
  assert.throws(() => post(chat, '  anyone up for a   PLAYTEST?  ', CLIENT_A, '10.0.0.2'), {
    status: 429,
    message: REJECTIONS.duplicate,
  });
  assert.doesNotThrow(() => post(chat, 'Anyone up for a playtest?', CLIENT_B, '10.0.0.3'));
  advance(LIMITS.DUPLICATE_WINDOW_MS);
  assert.doesNotThrow(() => post(chat, 'Anyone up for a playtest?', CLIENT_A, '10.0.0.4'));
});

test('three distinct reporters hide a message; repeat and self reports do not count', () => {
  const { chat } = freshChat();
  const target = post(chat, 'questionable message');
  assert.throws(() => chat.reportMessage(target.id, { clientId: CLIENT_A }), { message: REJECTIONS.ownReport });

  assert.deepEqual(chat.reportMessage(target.id, { clientId: CLIENT_B }), { id: target.id, reported: true, hidden: false });
  chat.reportMessage(target.id, { clientId: CLIENT_B });
  assert.equal(chat.reportMessage(target.id, { clientId: CLIENT_C }).hidden, false);
  assert.equal(chat.reportMessage(target.id, { clientId: CLIENT_D }).hidden, true);

  const listing = chat.listMessages();
  assert.equal(listing.messages.length, 0);
  assert.deepEqual(listing.removedIds, [target.id]);
  assert.throws(() => chat.reportMessage('missing-id', { clientId: CLIENT_B }), { status: 404 });
});

test('after=<id> returns only newer messages and signals a reset for unknown ids', () => {
  const { chat, advance } = freshChat();
  const first = post(chat, 'first', CLIENT_A, '1');
  advance(1000);
  const second = post(chat, 'second', CLIENT_B, '2');
  advance(1000);
  const third = post(chat, 'third', CLIENT_C, '3');

  assert.deepEqual(chat.listMessages({ after: first.id }).messages.map((message) => message.id), [second.id, third.id]);
  assert.deepEqual(chat.listMessages({ after: third.id }).messages, []);
  const unknown = chat.listMessages({ after: 'gone' });
  assert.equal(unknown.reset, true);
  assert.equal(unknown.messages.length, 3);
});

test('keeps the newest stored messages and caps the listing', () => {
  const { chat, advance } = freshChat();
  const clientIds = Array.from({ length: 120 }, (_, index) => `client-many-${String(index).padStart(4, '0')}`);
  for (let index = 0; index < LIMITS.MAX_STORED_MESSAGES + 20; index += 1) {
    post(chat, `note number ${index}`, clientIds[index % clientIds.length], `ip-${index % clientIds.length}`);
    advance(LIMITS.RATE_LIMIT_WINDOW_MS);
  }
  const listing = chat.listMessages();
  assert.equal(listing.messages.length, LIMITS.MAX_RETURNED_MESSAGES);
  assert.equal(listing.messages.at(-1).body, `note number ${LIMITS.MAX_STORED_MESSAGES + 19}`);
});

test('moderation requires the configured token and hides, restores or deletes', () => {
  const { chat } = freshChat();
  const target = post(chat, 'needs a look');
  assert.throws(() => chat.moderateMessage(target.id, { action: 'hide' }, ''), { status: 401 });
  assert.throws(() => chat.moderateMessage(target.id, { action: 'hide' }, 'wrong-token'), { status: 403 });
  assert.throws(() => chat.moderationQueue(`${MODERATOR_TOKEN}x`), { status: 403 });
  assert.throws(() => chat.moderateMessage(target.id, { action: 'nuke' }, MODERATOR_TOKEN), {
    message: REJECTIONS.moderationAction,
  });

  assert.equal(chat.moderateMessage(target.id, { action: 'hide' }, MODERATOR_TOKEN).status, 'hidden');
  assert.equal(chat.listMessages().messages.length, 0);
  assert.equal(chat.moderationQueue(MODERATOR_TOKEN).messages[0].hiddenReason, 'moderator');
  assert.equal(chat.moderateMessage(target.id, { action: 'restore' }, MODERATOR_TOKEN).status, 'visible');
  assert.equal(chat.listMessages().messages.length, 1);
  assert.equal(chat.moderateMessage(target.id, { action: 'delete' }, MODERATOR_TOKEN).status, 'deleted');
  assert.deepEqual(chat.listMessages().removedIds, [target.id]);
  assert.equal(chat.moderationQueue(MODERATOR_TOKEN).messages.length, 0);
});

test('moderation is refused when no strong token is configured', () => {
  const { chat } = freshChat({ moderatorToken: 'short' });
  const target = post(chat, 'hello');
  assert.throws(() => chat.moderateMessage(target.id, { action: 'hide' }, 'short'), {
    status: 503,
    message: REJECTIONS.moderationOff,
  });
});

test('HTTP routes under /api/community-chat', async () => {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/community-chat`;
  const json = { 'Content-Type': 'application/json' };
  try {
    const created = await fetch(`${base}/messages`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify({ name: 'Ada', body: 'gm Lobby', clientId: CLIENT_A }),
    });
    assert.equal(created.status, 201);
    const message = await created.json();

    const rejected = await fetch(`${base}/messages`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify({ name: 'Ada', body: 'see https://phish.example', clientId: CLIENT_A }),
    });
    assert.equal(rejected.status, 400);
    assert.deepEqual(await rejected.json(), { error: REJECTIONS.link, code: 'link' });

    const listing = await (await fetch(`${base}/messages`)).json();
    assert.equal(listing.messages.at(-1).id, message.id);
    const incremental = await (await fetch(`${base}/messages?after=${message.id}`)).json();
    assert.deepEqual(incremental.messages, []);

    const report = await fetch(`${base}/messages/${message.id}/report`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify({ clientId: CLIENT_B }),
    });
    assert.equal((await report.json()).reported, true);

    const moderate = (token) =>
      fetch(`${base}/messages/${message.id}/moderate`, {
        method: 'POST',
        headers: token ? { ...json, Authorization: `Bearer ${token}` } : json,
        body: JSON.stringify({ action: 'hide' }),
      });
    assert.equal((await moderate('')).status, 401);
    assert.equal((await moderate('not-the-token')).status, 403);
    assert.equal((await moderate(MODERATOR_TOKEN)).status, 200);
    assert.equal((await fetch(`${base}/moderation`)).status, 401);
    const queue = await fetch(`${base}/moderation`, { headers: { Authorization: `Bearer ${MODERATOR_TOKEN}` } });
    assert.equal((await queue.json()).messages[0].id, message.id);
  } finally {
    server.close();
  }
});
