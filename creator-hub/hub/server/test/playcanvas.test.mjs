import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as playCanvas from '../connectors/playCanvas.mjs';
import * as catalog from '../catalog.mjs';

test('PlayCanvas resources are external learn records, not tested Tari integrations', async () => {
  const { records } = await playCanvas.fetchLive();
  assert.ok(records.length >= 10);
  for (const r of records) {
    assert.equal(r.type, 'learn');
    assert.equal(r.ecosystem, 'playcanvas');
    assert.equal(r.native, false);
    assert.equal(r.tariCompatible, null, 'external engine: Tari compat not asserted');
    assert.ok(r.sourceUrl?.startsWith('http'));
    assert.ok(r.topic, 'classified by creator goal');
  }
  // Required coverage areas are present.
  const titles = records.map((r) => r.title.toLowerCase()).join(' | ');
  for (const area of ['input', 'physics', 'animation', 'sound', 'camera', 'user interface', 'debug', 'publish']) {
    assert.ok(titles.includes(area), `covers ${area}`);
  }
});

test('the PlayCanvas agent-skills repo is labeled external, not a native TariSkill', async () => {
  const { records } = await playCanvas.fetchLive();
  const skills = records.find((r) => /agent skills/i.test(r.title));
  assert.ok(skills);
  assert.ok(/external/i.test(skills.summary) || skills.tags.includes('external'));
  assert.equal(skills.ecosystem, 'playcanvas');
  assert.notEqual(skills.ecosystem, 'tari-ootle');
});

test('PlayCanvas surfaces in Learn, filling the Build-a-frontend and Troubleshoot goals', () => {
  catalog.load();
  const view = catalog.learn();
  const byTopic = Object.fromEntries(view.topics.map((t) => [t.id, t.items]));
  assert.ok(byTopic['build-frontend'].some((r) => r.ecosystem === 'playcanvas'), 'PlayCanvas under Build a frontend');
  assert.ok(byTopic.troubleshoot.some((r) => r.ecosystem === 'playcanvas'), 'PlayCanvas under Troubleshoot');
});

test('learn ecosystem filter narrows to PlayCanvas', () => {
  catalog.load();
  const view = catalog.learn({ ecosystem: 'playcanvas' });
  const all = [...view.topics.flatMap((t) => t.items), ...view.other];
  assert.ok(all.length >= 10);
  assert.ok(all.every((r) => r.ecosystem === 'playcanvas'));
});

test('PlayCanvas source URLs avoid the previously-broken paths', async () => {
  const { records } = await playCanvas.fetchLive();
  for (const r of records) {
    assert.doesNotMatch(r.sourceUrl, /user-manual\/input\/mouse\/|user-manual\/sound\//, `${r.title} uses a corrected URL`);
    assert.match(r.sourceUrl, /^https:\/\//);
  }
  const input = records.find((r) => /input/i.test(r.title));
  assert.equal(input.sourceUrl, 'https://developer.playcanvas.com/user-manual/user-interface/input/');
  const sound = records.find((r) => /sound/i.test(r.title));
  assert.equal(sound.sourceUrl, 'https://developer.playcanvas.com/user-manual/editor/scenes/components/sound/');
});

test('PlayCanvas curated records are provisional (not a fabricated fresh upstream check)', async () => {
  const { records } = await playCanvas.fetchLive();
  for (const r of records) {
    assert.equal(r.provenance.sourceUpdatedAt, null);
    assert.equal(r.provenance.freshness, 'provisional');
    assert.ok(r.lastVerifiedAt);
  }
});
