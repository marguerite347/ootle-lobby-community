import test from 'node:test';
import assert from 'node:assert/strict';
import {createHuggingFaceSearch, normalizeHuggingFace} from '../huggingface.mjs';
import {fetchLive, selections} from '../connectors/huggingface.mjs';
import {repositorySkills, repositorySkillFiles} from '../repositorySkills.mjs';
const model = {id: 'creator/model', tags: ['text-to-speech', 'license:mit'], sha: 'abc', gated: 'auto', likes: 5};
test('normalization preserves license, revision, gating and unknown compatibility', () => {
  const item = normalizeHuggingFace(model, 'models');
  assert.equal(item.license, 'mit'); assert.equal(item.provenance.upstreamRevision, 'abc');
  assert.match(item.summary, /Access conditions/); assert.equal(item.tariCompatible, null);
  assert.equal(normalizeHuggingFace({...model, tags: []}, 'datasets').license, null);
  assert.throws(() => normalizeHuggingFace({...model, private: true}, 'models'));
  for (const id of ['../secret', 'a/../secret', 'https://evil.test', 'a?foo']) assert.throws(() => normalizeHuggingFace({id}, 'spaces'));
});
test('search confines remote requests, encodes queries and paginates using cursor only', async () => {
  const urls = [];
  const search = createHuggingFaceSearch({read: async url => {urls.push(new URL(url));return {data: [model], link: '<https://huggingface.co/api/models?cursor=page2>; rel="next"'};}});
  const first = await search({q: 'voice & music'});
  assert.equal(first.nextCursor, 'page2');
  await search({q: 'voice & music', cursor: first.nextCursor});
  assert.equal(urls[0].searchParams.get('search'), 'voice & music'); assert.equal(urls[1].searchParams.get('cursor'), 'page2');
  assert.equal(urls[1].origin, 'https://huggingface.co');
});
test('invalid parameter families cannot trigger network requests', async () => {
  const search = createHuggingFaceSearch({read: () => {throw Error('Network should not run');}});
  for (const kind of [null, false, [], {}, '../models']) await assert.rejects(search({kind}), {status: 400});
  for (const q of [null, false, [], {}, 'x'.repeat(161)]) await assert.rejects(search({q}), {status: 400});
  for (const cursor of [null, [], {}, false, 'x'.repeat(4097)]) await assert.rejects(search({cursor}), {status: 400});
});
test('cached results avoid repeat calls and expired results are visibly stale on failure', async () => {
  let time = 0, calls = 0;
  const search = createHuggingFaceSearch({now: () => time, read: async () => {if (++calls > 1) throw Error('Offline');return {data: [model]};}});
  await search(); assert.equal((await search()).cached, true); assert.equal(calls, 1);
  time = 300001; const stale = await search(); assert.equal(stale.stale, true); assert.equal(stale.items.length, 1);
});
test('foreign pagination links are ignored and private results excluded', async () => {
  const search = createHuggingFaceSearch({read: async () => ({data: [model, {...model, private: true}], link: '<https://evil.test/api/models?cursor=bad>; rel="next"'})});
  const result = await search(); assert.equal(result.nextCursor, null); assert.equal(result.items.length, 1);
});
test('curated import is atomic on an upstream failure', async () => {
  const result = await fetchLive({read: async url => ({data: {id: new URL(url).pathname.split('/').slice(3).join('/')}})});
  assert.equal(result.records.length, Object.values(selections).flat().length);
  await assert.rejects(fetchLive({read: async () => {throw Error('Offline');}}), /Offline/);
});
test('all Hugging Face skill bundles preserve references, source pins and license', () => {
  const skills = repositorySkills.filter(item => item.creatorId === 'huggingface');
  assert.equal(skills.length, 26);
  for (const skill of skills) {
    const files = repositorySkillFiles(skill.id);
    assert.ok(files['SKILL.md']); assert.match(files.LICENSE, /Apache License/);
    assert.match(JSON.parse(files['UPSTREAM.json']).revision, /^[a-f0-9]{40}$/);
    for (const name of skill.files) assert.equal(typeof files[name], 'string');
  }
});
