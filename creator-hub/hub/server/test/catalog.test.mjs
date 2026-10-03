import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeResource, RESOURCE_TYPES } from '../model.mjs';
import * as catalog from '../catalog.mjs';
import {
  GOAL_STARTER_SHELF_SIZE,
  gdevelopStarterDimension,
  saveProjectButtonLabel,
  starterProjectPath,
  threeDimensionalShelfLabel,
} from '../../shared/starterShelf.mjs';

test('makeResource keeps imported facts separate from editorial and records provenance', () => {
  const r = makeResource({
    id: 'x:app:demo', type: 'app', ecosystem: 'tari-ootle', title: 'Demo',
    sourceId: 'src', sourceName: 'Src', sourceUrl: 'https://example.com',
    verification: 'source-attested',
  });
  assert.equal(r.native, true); // tari-ootle is native
  assert.equal(r.provenance.sourceId, 'src');
  assert.ok(r.provenance.fetchedAt);
  assert.deepEqual(r.editorial.collections, []); // editorial never populated by import
  assert.equal(r.license, null); // unknown license recorded explicitly
});

test('unknown resource type falls back to app; ecosystem native flag resolves', () => {
  const r = makeResource({ id: 'y', type: 'not-a-type', ecosystem: 'gdevelop', title: 'G', sourceId: 's' });
  assert.ok(RESOURCE_TYPES.includes(r.type));
  assert.equal(r.native, false);
});

test('catalog loads the committed seed with real records from all sources', () => {
  const snap = catalog.load();
  assert.ok(snap.records.length >= 40, `expected many records, got ${snap.records.length}`);
  const sourceIds = new Set(snap.sources.map((s) => s.id));
  for (const id of ['ootle-starters', 'ootle-apps-directory', 'gdevelop-examples', 'luanti-contentdb', 'creator-resource-library']) {
    assert.ok(sourceIds.has(id), `missing source ${id}`);
  }
});

test('search filters by ecosystem/type and sorts native Ootle first', () => {
  catalog.load();
  const apps = catalog.search({ ecosystem: 'tari-ootle', type: 'app' });
  assert.ok(apps.length >= 1);
  assert.ok(apps.every((r) => r.ecosystem === 'tari-ootle' && r.type === 'app'));

  const all = catalog.search({});
  const firstExternalIdx = all.findIndex((r) => !r.native);
  const lastNativeIdx = all.map((r) => r.native).lastIndexOf(true);
  assert.ok(firstExternalIdx === -1 || lastNativeIdx < firstExternalIdx, 'native resources should sort before external');
});

test('text search matches titles and tags', () => {
  catalog.load();
  const res = catalog.search({ q: 'guessing' });
  assert.ok(res.some((r) => /guessing/i.test(r.title)));
});

test('onboarding resolves a native path to concrete recommended starters', () => {
  catalog.load();
  const p = catalog.onboarding('ootle-onchain-game');
  assert.ok(p);
  assert.equal(p.ecosystem, 'tari-ootle');
  assert.ok(p.recommended.length >= 1);
  assert.ok(p.recommended.every((r) => r.ecosystem === 'tari-ootle'));
});

test('2D no/low-code goal recommends 2D starters and labels any kept 3D example', () => {
  catalog.load();
  const path = catalog.onboarding('nocode-2d-game');
  const shelf = path.recommended.slice(0, GOAL_STARTER_SHELF_SIZE);
  assert.ok(shelf.length >= 4, `expected at least 4 starters, got ${shelf.length}`);
  const twoDimensional = shelf.filter((record) => record.starterDimension === '2d');
  assert.ok(twoDimensional.length >= 4);
  assert.ok(twoDimensional.length * 2 >= shelf.length, '2D starters must be the majority of the shelf');
  for (const record of shelf) {
    if (record.starterDimension === '3d' || gdevelopStarterDimension(record) === '3d') {
      assert.equal(record.starterDimension, '3d');
      assert.equal(threeDimensionalShelfLabel(record.starterDimension), '3D');
      assert.ok(record.tags.includes('3d'));
      assert.equal(record.tags.includes('2d'), false);
    }
  }
  assert.equal(shelf.some((record) => record.id === 'gdevelop:starter:3d-bomber-bunny'), false);
  assert.equal(shelf.some((record) => record.id === 'gdevelop:starter:360-platformer'), true);
  const base = path.preferred || shelf[0];
  assert.equal(saveProjectButtonLabel(base.title), `Save project from ${base.title} →`);
  assert.equal(starterProjectPath(base.id), `/create/project?template=${encodeURIComponent(base.id)}`);
  assert.equal(starterProjectPath(base.id).includes('editor.gdevelop.io'), false);
});

test('no-code 2D collection does not lead with 3D examples', () => {
  catalog.load();
  const collection = catalog.collections().find((item) => item.id === 'nocode-games');
  const gdevelopStarters = catalog.search({ ecosystem: 'gdevelop', type: 'starter' });
  const twoDimensional = gdevelopStarters.filter((record) => gdevelopStarterDimension(record) === '2d');
  assert.ok(collection);
  assert.equal(collection.count, twoDimensional.length);
  assert.ok(collection.items.length >= 4);
  assert.ok(collection.items.every((record) => record.starterDimension === '2d'));
  assert.equal(collection.items.some((record) => gdevelopStarterDimension(record) === '3d'), false);

  const bomber = gdevelopStarters.find((record) => record.id === 'gdevelop:starter:3d-bomber-bunny');
  const platformer = gdevelopStarters.find((record) => record.id === 'gdevelop:starter:360-platformer');
  assert.ok(bomber.tags.includes('3d'));
  assert.equal(bomber.tags.includes('2d'), false);
  assert.ok(platformer.tags.includes('2d'));
  assert.equal(platformer.tags.includes('3d'), false);
});
