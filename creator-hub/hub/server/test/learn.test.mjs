import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as catalog from '../catalog.mjs';
import * as ootleEducation from '../connectors/ootleEducation.mjs';

test('ootleEducation yields source-attested native learn records with topics', async () => {
  const { records } = await ootleEducation.fetchLive();
  assert.ok(records.length >= 4);
  for (const r of records) {
    assert.equal(r.type, 'learn');
    assert.equal(r.ecosystem, 'tari-ootle');
    assert.equal(r.verification, 'source-attested');
    assert.ok(r.sourceUrl?.startsWith('https://ootle.tari.com'));
    assert.ok(r.topic, 'each guide has a creator-goal topic');
  }
});

test('learn() groups learn records by creator-goal topic', () => {
  catalog.load();
  const view = catalog.learn();
  const topics = Object.fromEntries(view.topics.map((t) => [t.id, t.items]));
  assert.ok(topics.understand.some((r) => /playground/i.test(r.title)), 'orientation under understand');
  assert.ok(topics['use-templates'].some((r) => /cli/i.test(r.title)), 'CLI under use-templates');
  assert.ok(topics['test-deploy'].length >= 1, 'publishing/testing under test-deploy');
  // Every grouped item is a learn record.
  assert.ok(view.topics.flatMap((t) => t.items).every((r) => r.type === 'learn'));
});

test('one canonical CLI record serves multiple goals (no duplicate page records)', async () => {
  const { records } = await ootleEducation.fetchLive();
  const cli = records.filter((r) => r.sourceUrl === 'https://ootle.tari.com/guides/cli/');
  assert.equal(cli.length, 1, 'a single record per canonical page (CLI covers use + test)');
  assert.ok(cli[0].topics.includes('use-templates') && cli[0].topics.includes('test-deploy'));
});

test('selecting a topic does NOT disable other populated topics (switch-topic regression)', () => {
  catalog.load();
  const all = catalog.learn();
  const populated = all.topics.filter((t) => t.items.length).map((t) => t.id);
  assert.ok(populated.length >= 2, 'several topics populated');
  // With a topic selected, availability of the other topics is unchanged.
  const withTopic = catalog.learn({ topic: 'use-templates' });
  const stillPopulated = withTopic.topics.filter((t) => t.items.length).map((t) => t.id);
  assert.deepEqual(stillPopulated.sort(), populated.sort(), 'topic is a display selector, not a filter that empties other buckets');
});

test('curated Ootle education is provisional, not a fabricated fresh upstream check', async () => {
  const { records } = await ootleEducation.fetchLive();
  for (const r of records) {
    assert.equal(r.provenance.sourceUpdatedAt, null, 'upstream time left unknown');
    assert.equal(r.provenance.freshness, 'provisional', 'curated snapshot marked provisional');
    assert.ok(r.lastVerifiedAt, 'editorial review date preserved');
  }
});

test('learn facets expose level and format', () => {
  catalog.load();
  const view = catalog.learn();
  assert.ok(Object.keys(view.facets.level || {}).length >= 1);
  assert.ok(Object.keys(view.facets.format || {}).length >= 1);
});

test('creator categories cover every learning record without inflating the total', () => {
  catalog.load();
  const view=catalog.learn();
  const ids=new Set(view.categories.flatMap(t=>t.items.map(r=>r.id)));
  assert.equal(ids.size,view.count);
  for(const id of ['game-design','engines','blueprints-verse','assets','audio','marketing','agent-workflows','tari-ootle']) {
    assert.ok(view.categories.find(t=>t.id===id)?.items.length,`${id} is populated`);
  }
});

test('learning skills link to real skill surfaces and preserve draft labels', () => {
  catalog.load();
  const skills=catalog.learn().categories.flatMap(t=>t.items).filter(r=>r.learningKind==='skill');
  assert.ok(skills.some(r=>r.learningHref==='/skills/frontend-integration' && r.lifecycle==='draft'));
  assert.ok(skills.some(r=>r.learningHref.startsWith('/skills?q=') && /Blueprint/i.test(r.title)));
  assert.ok(catalog.learn({ecosystem:'playcanvas'}).categories.flatMap(t=>t.items).every(r=>r.ecosystem==='playcanvas'));
});

test('category mapping supports overlapping disciplines and unknown metadata', async () => {
  const {categoriesFor}=await import('../learningCategories.mjs');
  assert.deepEqual(categoriesFor({title:'Unreal Blueprints'}),['engines','blueprints-verse']);
  assert.deepEqual(categoriesFor({title:'Miscellaneous reference'}),['references']);
  assert.deepEqual(categoriesFor({title:'Audacity',tags:['audio']}),['audio']);
});

test('skill projections honor existing native and verification filters', () => {
  catalog.load();
  assert.ok(catalog.learn({native:true}).categories.flatMap(t=>t.items).every(r=>r.native));
  assert.ok(catalog.learn({verified:true}).categories.flatMap(t=>t.items).every(r=>r.verification!=='unverified'));
});
