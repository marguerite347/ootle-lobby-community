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

test('October additions are shared and bad media retains the last accepted feed', async () => {
 const feed=structuredClone(seed);
 feed.contests=[{id:'october-2026',title:'October submissions',threadUrl:'https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396',checkedAt:'2026-10-03T12:00:00Z',observedSubmissionPosts:1,entries:[{slug:'example',title:'Example',summary:'A submitted game.',creator:'Creator',sourceUrl:'https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396/5',repoUrl:'https://github.com/example/game',publishedAt:'2026-10-03T12:00:00Z',updatedAt:'2026-10-03T12:00:00Z',technologies:[]}]}];
 let clock=1;
 const read=createCommunityContent({initial:seed,now:()=>clock,read:async()=>{
   const next=structuredClone(feed);
   if(clock>1)next.contests[0].entries[0].repoUrl='javascript:bad';
   return next;
 }});
 assert.equal((await read()).contests[0].entries[0].slug,'example');
 clock=60002;
 assert.equal((await read()).contests[0].entries[0].repoUrl,'https://github.com/example/game');
 assert.equal((await read()).cached,true);
});
test('older September feeds keep the bundled October section available',async()=>{
 const read=createCommunityContent({initial:seed,read:async()=>seed,now:()=>1});
 assert.equal((await read()).contests[0].id,'october-2026');
});

test('older content feeds retain the bundled external community registry',async()=>{
 const read=createCommunityContent({initial:seed,read:async()=>seed,now:()=>1});
 assert.equal((await read()).communityProjects.length,2);
});
