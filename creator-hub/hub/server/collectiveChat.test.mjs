import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const dir = mkdtempSync(path.join(tmpdir(), 'hub-collective-chat-'));
process.env.CREATOR_HUB_DATA_DIR = dir;

const chat = await import('./collectiveChat.mjs');
const { createApp } = await import('./app.mjs');

after(() => rmSync(dir, { recursive: true, force: true }));

test('create + list persists lobby-collective messages with identity stamps', () => {
  const empty = chat.getRoom('lobby-collective');
  assert.equal(empty.roomId, 'lobby-collective');
  assert.equal(empty.messages.length, 0);

  const saved = chat.addMessage('lobby-collective', {
    author: 'Marguerite',
    authorKind: 'Human',
    body: '[working] Chat · Slice 1 persist · next: PR · due: 10:00 ET',
    kind: 'working',
    artifactUrl: 'jam-handoff/chat/moderation-rules-20260924.md',
  });
  assert.ok(saved.id);
  assert.equal(saved.clientState, 'sent');
  assert.equal(saved.authorKind, 'Human');
  assert.equal(saved.label, 'Human');
  assert.match(saved.at, /^\d{4}-/);

  const agent = chat.addMessage('lobby-collective', {
    author: 'QA bot',
    authorKind: 'Agent',
    roleName: 'QA',
    body: '[delivered] smoke create+list · verify: node test',
    kind: 'delivered',
  });
  assert.equal(agent.label, 'Agent · QA');

  const room = chat.getRoom('lobby-collective');
  assert.equal(room.messages.length, 2);

  const file = path.join(dir, 'collective-chat', 'rooms', 'lobby-collective.json');
  assert.ok(existsSync(file));
  const disk = JSON.parse(readFileSync(file, 'utf8'));
  assert.equal(disk.messages.length, 2);
});

test('rejects invalid body/kind/authorKind', () => {
  assert.throws(() => chat.addMessage('lobby-collective', { author: 'x', authorKind: 'Human', body: '', kind: 'working' }), { status: 400 });
  assert.throws(() => chat.addMessage('lobby-collective', { author: 'x', authorKind: 'Human', body: 'ok', kind: 'nope' }), { status: 400 });
  assert.throws(() => chat.addMessage('lobby-collective', { author: 'x', authorKind: 'Bot', body: 'ok', kind: 'working' }), { status: 400 });
});

test('HTTP GET/POST /api/collective-chat rooms', async () => {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const getEmpty = await fetch(`${base}/api/collective-chat/rooms/lobby-collective`);
    assert.equal(getEmpty.status, 200);
    const empty = await getEmpty.json();
    assert.ok(Array.isArray(empty.messages));

    const post = await fetch(`${base}/api/collective-chat/rooms/lobby-collective/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: 'Moderator',
        authorKind: 'Moderator',
        kind: 'blocker',
        body: '[blocker] missing Hub↔agent bridge · owner: Producer · next: request after Slice 1 UI · due: same-day · attempted: SendToAgent only',
      }),
    });
    assert.equal(post.status, 201);
    const msg = await post.json();
    assert.equal(msg.clientState, 'sent');
    assert.equal(msg.authorKind, 'Moderator');

    const listed = await (await fetch(`${base}/api/collective-chat/rooms/lobby-collective`)).json();
    assert.ok(listed.messages.some((m) => m.id === msg.id));
  } finally {
    await new Promise((r) => server.close(r));
  }
});
