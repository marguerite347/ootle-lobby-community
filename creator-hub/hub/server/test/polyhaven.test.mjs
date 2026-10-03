import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as polyHaven from '../connectors/polyHaven.mjs';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

function stubAssets(payload) {
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => payload });
}

const SAMPLE = {
  grass_ground: { name: 'Grass Ground', type: 1, categories: ['nature'], tags: ['grass'], authors: { 'A Author': 'All' }, date_published: 1700000000, files_hash: 'hash-grass' },
  studio_hdri: { name: 'Studio HDRI', type: 0, categories: ['studio'], tags: ['light'], authors: { 'B Author': 'All' }, date_published: 1710000000, files_hash: 'hash-hdri' },
  chair_model: { name: 'Chair Model', type: 2, categories: ['furniture'], tags: ['chair'], authors: { 'C Author': 'All' }, date_published: 1690000000, files_hash: 'hash-chair' },
};

test('maps Poly Haven assets to CC0 asset records with source-hosted links and preview', async () => {
  stubAssets(SAMPLE);
  const { records } = await polyHaven.fetchLive();
  assert.equal(records.length, 3);
  const grass = records.find((r) => r.id === 'polyhaven:asset:grass-ground');
  assert.ok(grass);
  assert.equal(grass.type, 'asset');
  assert.equal(grass.ecosystem, 'creative');
  assert.equal(grass.license, 'CC0');
  assert.equal(grass.category, 'texture');
  assert.equal(grass.sourceUrl, 'https://polyhaven.com/a/grass_ground');
  assert.ok(grass.preview.image.includes('cdn.polyhaven.com/asset_img/thumbs/grass_ground.png'));
  assert.equal(grass.provenance.upstreamRevision, 'hash-grass'); // idempotent revision
  assert.match(grass.attribution, /A Author/);
  assert.equal(grass.verification, 'source-attested');
  assert.equal(grass.tariCompatible, null);
});

test('sorts by recency and yields stable, de-duplicated ids on replay', async () => {
  stubAssets(SAMPLE);
  const a = (await polyHaven.fetchLive()).records;
  const b = (await polyHaven.fetchLive()).records; // replay
  assert.deepEqual(a.map((r) => r.id), b.map((r) => r.id), 'ids are stable across refreshes');
  assert.equal(new Set(a.map((r) => r.id)).size, a.length, 'no duplicate ids');
  // Most recently published first (studio_hdri @1710 > grass @1700 > chair @1690).
  assert.equal(a[0].id, 'polyhaven:asset:studio-hdri');
});

test('propagates API failure so ingest keeps last-good', async () => {
  globalThis.fetch = async () => { throw new Error('provider down'); };
  await assert.rejects(() => polyHaven.fetchLive());
});

// Malformed but HTTP-success payloads must be rejected so ingest retains last-good
// (rather than replacing the source with zero or fabricated records).
for (const [label, payload] of [
  ['empty object', {}],
  ['array', []],
  ['error field', { error: 'temporarily unavailable' }],
  ['string values (no asset shape)', { some_id: 'not-an-asset' }],
]) {
  test(`rejects malformed payload: ${label}`, async () => {
    stubAssets(payload);
    await assert.rejects(() => polyHaven.fetchLive());
  });
}

test('does not fabricate a listing from an error entry', async () => {
  stubAssets({ error: 'temporarily unavailable', ArmChair_01: { name: 'Arm Chair', type: 2, date_published: 1, files_hash: 'h' } });
  // The `error` field makes the whole payload invalid → reject (no partial fabricated listing).
  await assert.rejects(() => polyHaven.fetchLive());
});
