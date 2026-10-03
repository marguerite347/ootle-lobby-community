import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {acceptedContent, createCommunityContent} from '../communityContent.mjs';
const seed = JSON.parse(readFileSync(new URL('../../data/contests/community-content.json', import.meta.url), 'utf8'));
test('rejects unrecognized or partial content without replacing the accepted snapshot', async () => {
  assert.throws(() => acceptedContent({...seed,projects:seed.projects.slice(1)}));
  const bad = structuredClone(seed);bad.projects[0].technologies[0].sourceUrl='javascript:alert(1)';
  const read = createCommunityContent({initial:seed,read:async()=>bad,now:()=>1});
  assert.deepEqual((await read()).projects, seed.projects);
  assert.equal((await read()).cached, true);
});
test('an accepted revision replaces the content, deduplicates reads, and retains it through an outage', async () => {
  let clock=1,calls=0;
  const changed=structuredClone(seed);changed.revision='b'.repeat(40);changed.projects[0].summary='A reviewed correction.';
  const read=createCommunityContent({initial:seed,now:()=>clock,read:async()=>{calls++;if(calls>1)throw new Error('Unavailable');return changed;}});
  const results=await Promise.all([read(),read()]);
  assert.equal(calls,1);assert.equal(results[0].revision,changed.revision);assert.equal(results[0].cached,false);
  clock=60002;assert.equal((await read()).revision,changed.revision);assert.equal((await read()).cached,true);
});
