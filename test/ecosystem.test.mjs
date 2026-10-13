import test from 'node:test';
import assert from 'node:assert/strict';
import {ecosystemResources, withEcosystemResources} from '../creator-hub/hub/server/ecosystemResources.mjs';
test('source references deduplicate canonical repositories without granting runtime status', () => {
  const entry=ecosystemResources.records.find(r=>r.key==='caravel-faucet');
  const result=withEcosystemResources([{id:'old-connector-id',repoUrl:entry.repoUrl}], [entry]);
  assert.equal(result.length,1);assert.equal(result[0].id,entry.id);
  assert.equal(result[0].demoUrl,null);assert.equal(result[0].verification,'source-attested');
  assert.match(result[0].summary,/claim untested/);
  assert.throws(()=>withEcosystemResources([], [{...entry,demoUrl:'https://example.com'}]));
  assert.throws(()=>withEcosystemResources([], [{...entry,sourceUrl:'http://localhost'}]));
});
test('recovered public demos retain source-attested status and L1 references retain their boundary', () => {
  const records=withEcosystemResources([]);
  assert.equal(records.length,ecosystemResources.records.length);
  const veil=records.find(r=>r.id.endsWith(':veil'));
  assert.equal(veil.demoUrl,'https://explorer.tari.mw/');
  assert.equal(veil.verification,'source-attested');
  assert.equal(veil.readiness,'conceptual');
  assert.match(veil.summary,/October 13, 2026/);
  assert.throws(()=>withEcosystemResources([], [{...ecosystemResources.records.find(r=>r.key==='veil'),verification:'verified'}]));
  assert.equal(records.find(r=>r.id.endsWith(':tari-l1-wasm')).ecosystem,'tari');
});

test('recording and discussion provenance survive catalog normalization without runtime promotion', () => {
 const entry=ecosystemResources.records.find(r=>r.key==='caravel-faucet');
 const resource=withEcosystemResources([], [entry])[0];
 assert.equal(resource.preview.video,entry.preview.video);
 assert.equal(resource.discussionLinks[0].url,'https://x.com/DNodeCapital/status/2108867690085421447');
 assert.equal(resource.demoUrl,null);assert.equal(resource.readiness,'conceptual');
 assert.throws(()=>withEcosystemResources([], [{...entry,preview:{...entry.preview,source:'Verified gameplay'}}]));
 assert.throws(()=>withEcosystemResources([], [{...entry,discussionLinks:[{url:'javascript:alert(1)',platform:'X'}]}]));
});
