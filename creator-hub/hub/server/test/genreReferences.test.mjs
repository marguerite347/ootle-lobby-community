import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {canonicalReferenceUrl, normalizeGenreReference, withGenreReferences, loadGenreReferences} from '../genreReferences.mjs';

const fixture = {
  id: 'genre-reference:test-game', title: 'Test reference', sourceUrl: 'https://store.steampowered.com/app/123/Test_Game/',
  summary: 'Study escalating route choices.', genres: ['roguelike', 'deckbuilder'], studyFocus: ['risk and reward'],
  lastVerifiedAt: '2026-09-25', license: 'Proprietary',
  successEvidence: {kind: 'Steam player reception snapshot, not sales evidence', positive: 80, total: 100},
};

test('commercial references cannot become editable starters or fabricated popularity', () => {
  const record = normalizeGenreReference({...fixture, type: 'starter', ecosystem: 'tari-ootle', openSource: true, editable: true, repoUrl: 'https://example.com/source', signals: {stars: 9999}});
  assert.equal(record.type, 'learn');
  assert.equal(record.native, false);
  assert.equal(record.referenceOnly, true);
  assert.equal(record.editable, false);
  assert.equal(record.openSource, false);
  assert.equal(record.repoUrl, null);
  assert.equal(record.tariCompatible, null);
  assert.equal(record.provenance.fetchedAt, fixture.lastVerifiedAt);
  assert.equal(record.provenance.freshness, 'provisional');
  assert.equal(record.readiness, 'conceptual');
  assert.deepEqual(record.signals, {});
  assert.deepEqual(record.successEvidence, fixture.successEvidence);
  assert.match(record.summary, /Creative inspiration for internal experiments/);
  assert.ok(record.tags.includes('deckbuilder'));
});

test('deduplication uses stable ID or canonical source URL without modifying cached records', () => {
  const source = {id: 'cached:123', title: 'Old cached title', sourceUrl: 'http://store.steampowered.com/app/123/?l=french&utm_source=old', tags: ['cached'], editorial: {description: 'Creator annotation'}, privateFixtureField: 'retained'};
  const before = structuredClone(source);
  const unrelated = {id: 'unrelated', sourceUrl: 'https://example.com/other'};
  const reference = normalizeGenreReference(fixture);
  const result = withGenreReferences([source, unrelated], [reference, reference]);
  assert.equal(result.length, 2);
  assert.equal(result[0].id, source.id);
  assert.equal(result[0].referenceId, reference.id);
  assert.equal(result[0].editorial.description, source.editorial.description);
  assert.ok(result[0].tags.includes('cached'));
  assert.ok(result[0].tags.includes('genre-reference'));
  assert.deepEqual(source, before);
  assert.equal(result[1], unrelated);
  assert.equal(withGenreReferences([{id: reference.id, sourceUrl: 'https://example.com/old'}], [reference]).length, 1);
  assert.equal(canonicalReferenceUrl('https://www.example.com/game/?utm_medium=x#buy'), 'https://example.com/game');
});

test('invalid metadata and unsafe URLs are rejected before entering the catalog', () => {
  for (const change of [{id: '../bad'}, {sourceUrl: 'javascript:alert(1)'}, {sourceUrl: 'https://user:secret@example.com'}, {genres: []}, {lastVerifiedAt: 'not-a-date'}, {evidenceUrls: ['file:///secret']}]) {
    assert.throws(() => normalizeGenreReference({...fixture, ...change}), /Genre reference/);
  }
});

test('curated references remain discoverable beside an existing cache without an ingest write', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'genre-reference-cache-'));
  const previous = process.env.CREATOR_HUB_DATA_DIR;
  process.env.CREATOR_HUB_DATA_DIR = directory;
  mkdirSync(path.join(directory, 'cache'));
  const cachePath = path.join(directory, 'cache/catalog.json');
  const original = JSON.stringify({records: [{id: 'fixture:cached', title: 'Unrelated cached item', ecosystem: 'creative', type: 'learn', tags: []}], sources: [], generatedAt: '2026-09-01'});
  writeFileSync(cachePath, original);
  const catalog = await import('../catalog.mjs');
  const {createApp} = await import('../app.mjs');
  catalog.load();
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const references = loadGenreReferences();
    assert.ok(references.length > 0);
    const {gameLibrary} = await import('../gameLibrary.mjs');
    const {buildToolkit} = await import('../buildToolkit.mjs');
    assert.equal(gameLibrary(references).items.length, 0, 'references are not playable starters');
    const toolkit = buildToolkit(references, {idea: 'deckbuilder puzzle platformer'});
    assert.equal(toolkit.resources.foundations.length, 0);
    assert.equal(toolkit.resources.tools.length, 0);
    const listing = await (await fetch(base + '/api/resources?tag=genre-reference')).json();
    assert.equal(listing.count, references.length);
    for (const reference of references) {
      const response = await fetch(base + '/api/resources/' + encodeURIComponent(reference.id));
      assert.equal(response.status, 200);
      assert.equal((await response.json()).referenceOnly, true);
    }
    const query = encodeURIComponent(references[0].title);
    const search = await (await fetch(base + `/api/resources?q=${query}`)).json();
    assert.ok(search.items.some(record => record.id === references[0].id));
    assert.ok(catalog.get('fixture:cached'));
    assert.equal(readFileSync(cachePath, 'utf8'), original);
    assert.equal((await fetch(base + '/agent-docs/creator-hub/GENRE_REFERENCE_LIBRARY.md')).status, 200);
  } finally {
    await new Promise(resolve => server.close(resolve));
    if (previous === undefined) delete process.env.CREATOR_HUB_DATA_DIR; else process.env.CREATOR_HUB_DATA_DIR = previous;
    rmSync(directory, {recursive: true, force: true});
  }
});
