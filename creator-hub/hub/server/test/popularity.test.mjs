import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { computePopularity, STANDARD } from '../popularity.mjs';

test('a well-starred GitHub repo scores high with high confidence', () => {
  const p = computePopularity(
    { github: { stars: 10000, forks: 900, watchers: 300, pushedAt: new Date().toISOString() } },
    {},
  );
  assert.ok(p.score >= 60, `expected high score, got ${p.score}`);
  assert.equal(p.confidence, 'high');
  assert.ok(p.native.metric.includes('★'));
  assert.ok(p.sources.includes('GitHub'));
});

test('no signals => New with null score (no fabricated popularity)', () => {
  const p = computePopularity({}, {});
  assert.equal(p.score, null);
  assert.equal(p.tier, 'new');
  assert.equal(p.confidence, 'none');
});

test('incomparable metrics are normalized, not summed on raw scales', () => {
  // A huge download count must not exceed the normalized ceiling of 100.
  const p = computePopularity({ contentdb: { downloads: 5_000_000, score: 50000 } }, {});
  assert.ok(p.score <= 100);
  assert.ok(p.dimensions.reach <= 1);
});

test('hub engagement (stars/comments/forks) feeds the score', () => {
  const none = computePopularity({}, {});
  const engaged = computePopularity({}, { stars: 20, comments: 10, forks: 5, updatedAt: new Date().toISOString() });
  assert.equal(none.score, null);
  assert.ok(engaged.score > 0);
  assert.ok(engaged.sources.includes('Ootle Lobby'));
});

test('disclosed weights sum to 1', () => {
  const total = Object.values(STANDARD.dimensions).reduce((s, d) => s + d.weight, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
});

// Engagement store (isolated data dir).
const tmp = mkdtempSync(path.join(tmpdir(), 'hub-eng-'));
process.env.CREATOR_HUB_DATA_DIR = tmp;
const engagement = await import('../engagement.mjs');
after(() => rmSync(tmp, { recursive: true, force: true }));

test('star toggles per user and comments persist', () => {
  const r1 = engagement.toggleStar('resource', 'x:app:a', 'u1');
  assert.deepEqual(r1, { stars: 1, starred: true });
  engagement.toggleStar('resource', 'x:app:a', 'u2');
  const off = engagement.toggleStar('resource', 'x:app:a', 'u1');
  assert.equal(off.starred, false);
  assert.equal(engagement.counts('resource', 'x:app:a').stars, 1);

  engagement.addComment('resource', 'x:app:a', { author: 'bob', body: 'nice' });
  const st = engagement.state('resource', 'x:app:a', 'u2');
  assert.equal(st.stars, 1);
  assert.equal(st.starred, true);
  assert.equal(st.comments.length, 1);
  assert.equal(st.comments[0].author, 'bob');
});

test('empty comment is rejected', () => {
  assert.throws(() => engagement.addComment('resource', 'y', { author: 'a', body: '  ' }), (e) => e.status === 400);
});
