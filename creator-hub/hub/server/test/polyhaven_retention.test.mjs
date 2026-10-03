import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Set the isolated data dir BEFORE importing ingest/paths (module-cached at import).
const tmp = mkdtempSync(path.join(tmpdir(), 'ph-retain-'));
process.env.CREATOR_HUB_DATA_DIR = tmp;
const { ingest } = await import('../ingest.mjs');
const polyHaven = await import('../connectors/polyHaven.mjs');
after(() => rmSync(tmp, { recursive: true, force: true }));

const realFetch = globalThis.fetch;
function stub(payload) { globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => payload }); }

test('a malformed Poly Haven response retains last-good records as stale (not zero)', async () => {
  mkdirSync(path.join(tmp, 'cache'), { recursive: true });
  const prior = [
    { id: 'polyhaven:asset:a', title: 'A', provenance: { sourceId: 'polyhaven', freshness: 'current' } },
    { id: 'polyhaven:asset:b', title: 'B', provenance: { sourceId: 'polyhaven', freshness: 'current' } },
  ];
  writeFileSync(path.join(tmp, 'cache', 'catalog.json'), JSON.stringify({
    records: prior,
    sources: [{ id: 'polyhaven', name: 'Poly Haven', freshness: 'current', lastSuccessAt: '2020-01-01T00:00:00Z', recordCount: 2 }],
  }));

  stub({}); // HTTP-success but empty/malformed → connector must reject
  const failing = { source: polyHaven.source, fetchLive: polyHaven.fetchLive };
  try {
    const snap = await ingest({ connectors: [failing], enrich: false });
    const kept = snap.records.filter((r) => r.provenance.sourceId === 'polyhaven');
    assert.equal(kept.length, 2, 'both prior records retained (not replaced with zero)');
    assert.ok(kept.every((r) => r.provenance.freshness === 'stale'), 'retained records marked stale');
    const src = snap.sources.find((s) => s.id === 'polyhaven');
    assert.equal(src.freshness, 'stale');
    assert.equal(src.lastSuccessAt, '2020-01-01T00:00:00Z', 'lastSuccessAt not advanced on failure');
  } finally {
    globalThis.fetch = realFetch;
  }
});
