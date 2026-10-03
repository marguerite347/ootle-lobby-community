import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const tmp = mkdtempSync(path.join(tmpdir(), 'hub-ingest-'));
process.env.CREATOR_HUB_DATA_DIR = tmp;
const { ingest } = await import('../ingest.mjs');
const ootleStarters = await import('../connectors/ootleStarters.mjs');
after(() => rmSync(tmp, { recursive: true, force: true }));

function seedCache(records, sources) {
  mkdirSync(path.join(tmp, 'cache'), { recursive: true });
  writeFileSync(path.join(tmp, 'cache', 'catalog.json'), JSON.stringify({ records, sources }));
}

function connector(id, fetchLive) {
  return { source: { id, name: id, kind: 'test', canonicalUrl: 'https://example.com', ingestion: 'test', native: false }, fetchLive };
}

const prior = [
  { id: 'flaky:1', title: 'One', provenance: { sourceId: 'flaky', freshness: 'current' } },
  { id: 'flaky:2', title: 'Two', provenance: { sourceId: 'flaky', freshness: 'current' } },
  { id: 'flaky:3', title: 'Three', provenance: { sourceId: 'flaky', freshness: 'current' } },
];

// Blocker 3 — a total outage must retain last-good records as STALE and not claim freshness.
test('connector outage retains last-good records and marks the source stale', async () => {
  seedCache(prior, [{ id: 'flaky', name: 'flaky', freshness: 'current', lastSuccessAt: '2020-01-01T00:00:00Z', recordCount: 3 }]);
  const failing = connector('flaky', async () => { throw new Error('network down'); });

  const snap = await ingest({ connectors: [failing], enrich: false });
  const kept = snap.records.filter((r) => r.provenance.sourceId === 'flaky');
  assert.equal(kept.length, 3, 'all prior records retained');
  assert.ok(kept.every((r) => r.provenance.freshness === 'stale'), 'retained records marked stale');

  const src = snap.sources.find((s) => s.id === 'flaky');
  assert.equal(src.freshness, 'stale');
  assert.equal(src.recordCount, 3, 'record count reflects retained, not zero');
  assert.equal(src.lastSuccessAt, '2020-01-01T00:00:00Z', 'lastSuccessAt is NOT advanced on failure');
});

test('a successful connector replaces records and reports current freshness', async () => {
  seedCache(prior, [{ id: 'flaky', name: 'flaky', freshness: 'stale', lastSuccessAt: null, recordCount: 3 }]);
  const ok = connector('flaky', async () => ({ records: [
    { id: 'flaky:new', title: 'Fresh', provenance: { sourceId: 'flaky', freshness: 'current' } },
  ] }));
  const snap = await ingest({ connectors: [ok], enrich: false });
  const kept = snap.records.filter((r) => r.provenance.sourceId === 'flaky');
  assert.equal(kept.length, 1);
  assert.equal(snap.sources.find((s) => s.id === 'flaky').freshness, 'current');
});

// Blocker 3 (root cause) — ootleStarters must PROPAGATE a failed read, not swallow it.
test('ootleStarters.fetchLive rejects when the GitHub listing fails', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('simulated outage'); };
  try {
    await assert.rejects(() => ootleStarters.fetchLive(), /discovery failed/i);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('replaying curated education never refreshes upstream evidence, including legacy current cache', async () => {
  const education = await import('../connectors/ootleEducation.mjs');
  const original = await education.fetchLive();
  seedCache(original.records, [{ ...education.source, freshness: 'current', lastSuccessAt: '2026-09-19T00:00:00Z' }]);
  const reviewDates = original.records.map((r) => r.lastVerifiedAt);
  for (let run = 0; run < 2; run++) {
    const snapshot = await ingest({ connectors: [education], enrich: false });
    const src = snapshot.sources[0];
    assert.equal(src.freshness, 'provisional');
    assert.equal(src.lastSuccessAt, null, 'no fabricated upstream check, even from legacy cache');
    assert.ok(src.lastAttemptAt, 'local load attempt remains observable');
    assert.deepEqual(snapshot.records.map((r) => r.lastVerifiedAt), reviewDates);
    assert.ok(snapshot.records.every((r) => r.provenance.freshness === 'provisional'));
    assert.ok(snapshot.records.every((r) => r.provenance.sourceUpdatedAt === null));
    seedCache(snapshot.records, snapshot.sources);
  }
});

test('curated semantics apply even when an old connector reports current records', async () => {
  seedCache([], []);
  const staticSource = connector('static', async () => ({ records: [{
    id: 'static:1', lastVerifiedAt: '2020-01-01',
    provenance: { sourceId: 'static', freshness: 'current', sourceUpdatedAt: null },
  }] }));
  staticSource.source.kind = 'curated';
  const liveSource = connector('live', async () => ({ records: [{
    id: 'live:1', provenance: { sourceId: 'live', freshness: 'current' },
  }] }));
  const snapshot = await ingest({ connectors: [staticSource, liveSource], enrich: false });
  assert.equal(snapshot.records[0].provenance.freshness, 'provisional');
  assert.equal(snapshot.records[0].lastVerifiedAt, '2020-01-01');
  assert.equal(snapshot.sources[0].lastSuccessAt, null);
  assert.equal(snapshot.sources[1].freshness, 'current');
  assert.equal(snapshot.sources[1].lastSuccessAt, snapshot.sources[1].lastAttemptAt);
  assert.ok(snapshot.sources[1].lastSuccessAt);
});

test('canonical wiki wins duplicate app IDs, preserves community metadata and forum-only apps', async () => {
  const id = 'tari-ootle:app:shadowtix';
  seedCache([{ id, editorial: { description: 'Curator note' }, provenance: { sourceId: 'ootle-apps-directory' } }], []);
  const forum = connector('ootle-apps-directory', async () => ({records: [
    {id, demoUrl: 'https://old.example', signals: {discourse: {reads: 3}}, provenance: {sourceId: 'ootle-apps-directory'}},
    {id: 'forum-only', provenance: {sourceId: 'ootle-apps-directory'}},
  ]}));
  const wiki = connector('tari-wiki-apps', async () => ({records: [{id, demoUrl: 'https://shadowtix.shop/', provenance: {sourceId: 'tari-wiki-apps'}}]}));
  const snap = await ingest({connectors: [forum, wiki], enrich: false});
  assert.equal(snap.records.length, 2);
  assert.equal(snap.records.find(r=>r.id===id).demoUrl, 'https://shadowtix.shop/');
  assert.equal(snap.records.find(r=>r.id===id).editorial.description, 'Curator note');
  assert.equal(snap.records.find(r=>r.id===id).signals.discourse.reads, 3);
  seedCache(snap.records, snap.sources);
  const brokenWiki = connector('tari-wiki-apps', async()=>{throw new Error('offline');});
  const stale = await ingest({connectors: [forum, brokenWiki], enrich: false});
  assert.equal(stale.records.find(r=>r.id===id).demoUrl, 'https://shadowtix.shop/');
  assert.equal(stale.records.find(r=>r.id===id).provenance.freshness, 'stale');
});
