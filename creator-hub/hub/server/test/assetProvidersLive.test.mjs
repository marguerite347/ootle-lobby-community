import {test} from 'node:test';import assert from 'node:assert/strict';
import {fetchLive as ambient} from '../connectors/ambientCG.mjs';
import {fetchLive as kenney} from '../connectors/kenney.mjs';
const asset=i=>({id:'Stone'+i,title:'Stone '+i,type:'material',url:'https://ambientcg.com/a/Stone'+i,tags:[],thumbnails:{'512-WEBP':'https://example.com/stone.webp'}});
test('ambientCG fetches beyond the first page with unique source records',async()=>{
 const calls=[];const {records}=await ambient({read:async url=>{calls.push(url);return {totalResults:501,assets:url.includes('offset=0')?Array.from({length:500},(_,i)=>asset(i)):[asset(500)]};}});
 assert.equal(records.length,501);assert.equal(calls.length,2);assert.equal(records[0].access,'free');
});
test('ambientCG fails incomplete or duplicated batches',async()=>{
 await assert.rejects(ambient({read:async()=>({totalResults:501,assets:[asset(1)]})}),/duplicate/);
 await assert.rejects(ambient({read:async()=>({totalResults:501,assets:[]})}),/Incomplete/);
});
test('Kenney follows the directory pagination and records real pack previews',async()=>{
 const page=n=>`<div class='asset'><a href='https://kenney.nl/assets/pack-${n}'><div style='background-image:url("https://kenney.nl/media/pack-${n}.png")'></div></a><h2><a>Pack ${n}</a></h2><a href='https://kenney.nl/assets/category:Audio'>Audio</a></div>`;
 const calls=[];const {records}=await kenney({read:async url=>{calls.push(url);return url.endsWith('page:2')?page(2):page(1)+"<a href='https://kenney.nl/assets/page:2'>2</a>";}});
 assert.equal(calls.length,2);assert.equal(records.length,2);assert.equal(records[1].category,'audio');assert.equal(records[0].assetKind,'pack');
});
