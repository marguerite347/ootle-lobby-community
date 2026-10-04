import test from 'node:test';
import assert from 'node:assert/strict';
import {refreshCommunityMetrics,createCommunityProjectMetrics} from '../communityProjectMetrics.mjs';
const project={slug:'example',repoUrl:'https://github.com/example/project',forum:{topicId:210,postNumber:1,scope:'topic',url:'https://community.tari.com/t/210'}};
test('reads the full forum stream; records GitHub push separately from publication',async()=>{
 const calls=[];
 const read=async url=>{calls.push(url);if(url.includes('api.github'))return {stargazers_count:7,pushed_at:'2026-10-04T12:00:00Z'};if(url.includes('posts.json'))return {post_stream:{posts:[{id:2,post_number:2,post_type:1}]}};return {post_stream:{posts:[{id:1,post_number:1,post_type:1}],stream:[1,2]}};};
 const result=await refreshCommunityMetrics([project],{},read,0);
 assert.equal(result.items.example.github.count,7);assert.equal(result.items.example.forum.count,1);assert.equal(result.items.example.github.pushedAt,'2026-10-04T12:00:00Z');assert.equal(calls.length,3);
});
test('unknown remains unknown and failed refresh preserves last verified values',async()=>{
 const fail=async()=>{throw new Error('Rate limited');};
 const unknown=await refreshCommunityMetrics([project],{},fail,0);assert.equal(unknown.items.example.github.count,null);assert.equal(unknown.items.example.forum.count,null);
 const prior={items:{example:{github:{url:'https://github.com/example/project/stargazers',count:7,pushedAt:'2026-10-03T12:00:00Z',checkedAt:'2026-10-03T13:00:00Z'},forum:{url:'https://community.tari.com/t/210',count:2,checkedAt:'2026-10-03T13:00:00Z'}}}};
 const result=await refreshCommunityMetrics([project],prior,fail,1);assert.equal(result.items.example.github.count,7);assert.equal(result.items.example.github.checkedAt,prior.items.example.github.checkedAt);assert.equal(result.items.example.forum.count,2);
 const noForum=await refreshCommunityMetrics([{...project,forum:null}],{},fail,0);assert.equal(noForum.items.example.forum.count,null);assert.equal(noForum.items.example.forum.url,'');
});
test('shared-topic comments count only the project reply tree',async()=>{
 const posts=[{id:1,post_number:1},{id:2,post_number:2,reply_to_post_number:1},{id:3,post_number:3},{id:4,post_number:4,reply_to_post_number:2}];
 const read=async url=>url.includes('api.github')?{}:{post_stream:{posts,stream:posts.map(p=>p.id)}};
 const r=await refreshCommunityMetrics([{...project,forum:{...project.forum,scope:'replies'}}],{},read,0);assert.equal(r.items.example.forum.count,2);
});
test('deduplicates concurrent reads and refreshes at most daily per instance',async()=>{
 let clock=1,calls=0;const get=createCommunityProjectMetrics({initial:{items:{}},now:()=>clock,content:async()=>({communityProjects:[{...project,forum:null}]}),read:async()=>{calls++;return {stargazers_count:3};}});
 await Promise.all([get(),get()]);await get();assert.equal(calls,1);clock+=86400001;await get();assert.equal(calls,2);
});

test('October gets project-specific metrics without colliding with a community slug',async()=>{
 const calls=[];const get=createCommunityProjectMetrics({initial:{items:{}},content:async()=>({communityProjects:[{slug:'example',repoUrl:null,forum:null}],contests:[{id:'october-2026',entries:[{slug:'example',repoUrl:'https://github.com/example/october',sourceUrl:'https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396/5'}]}]}),read:async url=>{calls.push(url);return url.includes('api.github')?{stargazers_count:4}:{post_stream:{posts:[{id:5,post_number:5},{id:6,post_number:6,reply_to_post_number:5}],stream:[5,6]}};}});
 const result=await get();assert.equal(result.items.example.github,null);assert.equal(result.items['october:example'].github.count,4);assert.equal(result.items['october:example'].forum.count,1);assert.ok(calls.some(url=>url.includes('/396.json')));
});
