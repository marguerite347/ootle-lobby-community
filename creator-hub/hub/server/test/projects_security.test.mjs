import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const tmp = mkdtempSync(path.join(tmpdir(), 'hub-sec-'));
process.env.CREATOR_HUB_DATA_DIR = tmp;
const projects = await import('../projects.mjs');
const { createApp } = await import('../app.mjs');

before(() => projects.ensureStore());
after(() => rmSync(tmp, { recursive: true, force: true }));

// Blocker 1 — project ids must not escape the store (path traversal).
test('invalid / traversal ids are rejected before any filesystem access', async () => {
  for (const bad of ['../../outside', '..', 'a/b', 'foo/../bar', '.hidden', 'UPPER', 'a b']) {
    assert.equal(projects.isValidId(bad), false, `${bad} should be invalid`);
    await assert.rejects(() => projects.versions(bad), (e) => e.status === 400, `versions(${bad})`);
    await assert.rejects(() => projects.publish(bad, { state: {}, author: { name: 'x' } }), (e) => e.status === 400, `publish(${bad})`);
    await assert.rejects(() => projects.stateAt(bad, 'HEAD'), (e) => e.status === 400, `stateAt(${bad})`);
  }
  assert.equal(projects.isValidId('my-game-1a2b3c'), true);
});

test('HTTP: GET /api/projects with an encoded traversal id does not return outside state', async () => {
  const app = createApp();
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  const port = server.address().port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/projects/..%2F..%2F..%2Fetc`);
    assert.notEqual(res.status, 200, 'traversal id must not succeed');
    const body = await res.json().catch(() => ({}));
    assert.ok(!body.project && !body.state, 'no project/state should leak');
  } finally {
    server.close();
  }
});

// Blocker 2 — concurrent saves must serialize (no lost updates, no interleaving).
test('two simultaneous publishes to the same project both commit (serialized)', async () => {
  const { project } = await projects.create({ title: 'Race', templateId: 't', author: { name: 'a' } });
  const [r1, r2] = await Promise.all([
    projects.publish(project.id, { state: { components: [{ id: 'x' }], notes: 'A' }, message: 'save A', author: { name: 'alice' } }),
    projects.publish(project.id, { state: { components: [{ id: 'y' }], notes: 'B' }, message: 'save B', author: { name: 'bob' } }),
  ]);
  assert.ok(r1.head && r2.head && r1.head !== r2.head, 'each publish records a distinct commit');

  const versions = await projects.versions(project.id);
  const subjects = versions.map((v) => v.subject);
  assert.equal(versions.length, 3, 'create + two saves, none lost');
  assert.ok(subjects.includes('save A') && subjects.includes('save B'), 'both saves are in history');
});

// Blocker 2 — optimistic concurrency: a stale editor is told to reload.
test('publish with a stale expectedHead is rejected with 409', async () => {
  const { project, head } = await projects.create({ title: 'Optimistic', templateId: 't', author: { name: 'a' } });
  await projects.publish(project.id, { state: { notes: '1' }, message: 'first', author: { name: 'a' } });
  await assert.rejects(
    () => projects.publish(project.id, { state: { notes: '2' }, message: 'stale', author: { name: 'b' }, expectedHead: head }),
    (e) => e.status === 409,
  );
  // A publish with the current head still succeeds.
  const cur = (await projects.detail(project.id)).head;
  const ok = await projects.publish(project.id, { state: { notes: '3' }, message: 'fresh', author: { name: 'b' }, expectedHead: cur });
  assert.ok(ok.head);
});
