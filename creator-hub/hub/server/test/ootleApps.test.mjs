import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchLive, fetchPosts } from '../connectors/ootleApps.mjs';

const op = {id:1, post_number:1, cooked:'<ol><li><a href="https://dao.example/">DAO</a> — Governance</li></ol>'};
const detail = {id:2, post_number:3, cooked:'<h3>1. DAO</h3><p>Category: Governance</p><p>https://dao.example/</p><a href="https://github.com/example/dao">Source code</a>'};
const market = {id:3, post_number:12, cooked:'<p><strong>Project:</strong> Example Market</p><p>Website: <a href="https://market.example/">Visit</a></p><p>GitHub: <a href="https://github.com/example/market">Repository</a></p>'};

test('fetches missing reply IDs, parses labeled links and merges repeated directory headings', async () => {
  const requests=[];
  const read=async url=>{requests.push(url);return url.includes('posts.json') ? {post_stream:{posts:[market,detail]}} : {post_stream:{posts:[op],stream:[1,2,3]}}};
  const {records}=await fetchLive({read});
  assert.equal(requests.length,2);
  assert.match(requests[1],/post_ids\[\]=2/);
  assert.equal(records.length,2);
  assert.equal(records[0].repoUrl,'https://github.com/example/dao');
  assert.match(records[0].docsUrl,/\/3$/);
  assert.equal(records[1].repoUrl,'https://github.com/example/market');
  assert.equal(records[1].demoUrl,'https://market.example/');
});

test('incomplete or failed batches fail instead of silently deleting later apps', async () => {
  await assert.rejects(()=>fetchPosts(async ()=>({post_stream:{posts:[op],stream:[1,2]}})),/omitted/);
  await assert.rejects(()=>fetchPosts(async url=>{if(url.includes('posts.json'))throw Error('offline');return {post_stream:{posts:[op],stream:[1,2]}}}),/offline/);
});

test('reviewed narrative submissions are distinct from chat and duplicate mentions', async () => {
  const posts=[op,
    {id:1454,post_number:8,cooked:'<h1>ShadowTix: ticketing</h1><p>https://shadowtix.shop</p>'},
    {id:1455,post_number:9,cooked:'<p>Also shadowtix.shop and <a href="https://github.com/zvovanz-a1/tari-agent-pay">agent service</a></p>'},
    {id:4,post_number:11,cooked:'<p>A technical correction, not a new app.</p>'}];
  const {records}=await fetchLive({read:async()=>({post_stream:{posts,stream:posts.map(p=>p.id)}})});
  assert.deepEqual(records.map(r=>r.title),['DAO','ShadowTix','Tari Agent Pay']);
  assert.equal(records[2].readiness,'conceptual');
});
