import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const root=mkdtempSync(path.join(tmpdir(),'budget-test-'));
process.env.CREATOR_HUB_DATA_DIR=root;
const {createBuildBudgets}=await import('../buildBudgets.mjs');
const {createApp}=await import('../app.mjs');
after(()=>rmSync(root,{recursive:true,force:true}));
const input={title:'Playable sample',description:'A small working game',version:'v1',demoUrl:'https://example.com/game',category:'game',stage:'prototype',costs:{ai:0,assets:1.25,other:2},scope:'Includes all attempts; existing laptop and labor excluded.',shareConfirmed:true};
test('malformed costs reject and unknown optional values remain null',()=>{
 const store=createBuildBudgets(path.join(root,'validation'));
 for(const value of [null,undefined,'0',false,-1,NaN,Infinity,{},[]])assert.throws(()=>store.submit('one',{...input,costs:{...input.costs,ai:value}}));
 for(const value of ['javascript:alert(1)','https://user:secret@example.com'])assert.throws(()=>store.submit('one',{...input,demoUrl:value}));
 assert.throws(()=>store.submit('one',{...input,shareConfirmed:false}));
 store.submit('one',input);
 const [entry]=store.list([{id:'one',name:'Owner',showWork:true,showActivity:true}]);
 assert.equal(entry.creditUsd,null);assert.equal(entry.hours,null);assert.equal(entry.cashUsd,3.25);assert.equal(entry.recommendations,0);assert.equal(entry.costStatus,'self-reported');
});
test('HTTP authentication, recommendation deduplication, revisions, visibility and withdrawal',async()=>{
 const server=createApp().listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const base=`http://127.0.0.1:${server.address().port}/api`;
 async function call(route,body,key,method){const response=await fetch(base+route,{method:method||(body?'POST':'GET'),headers:{'Content-Type':'application/json',...(key?{Authorization:`Bearer ${key}`}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,data:await response.json()};}
 try{
 const owner=(await call('/creator-profiles',{name:'Owner',projects:[]})).data;
 const peer=(await call('/creator-profiles',{name:'Peer',projects:[]})).data;
 const report={...input,creatorId:owner.profile.id};
 assert.equal((await call('/build-budgets',report)).status,403);
 assert.equal((await call('/build-budgets',report,peer.editKey)).status,403);
 const {data:entry,status}=await call('/build-budgets',report,owner.editKey);assert.equal(status,201);
 const route=`/build-budgets/${entry.id}/recommend`;
 assert.equal((await call(route,{creatorId:owner.profile.id,tested:true,expectedRevision:1},owner.editKey)).status,400);
 assert.equal((await call(route,{creatorId:peer.profile.id,tested:false,expectedRevision:1},peer.editKey)).status,400);
 for(let index=0;index<2;index++)assert.equal((await call(route,{creatorId:peer.profile.id,tested:true,expectedRevision:1},peer.editKey)).status,200);
 let result=(await call('/build-budgets')).data.items[0];assert.equal(result.recommendations,1);assert.equal(result.reviews,undefined);assert.ok(!JSON.stringify(result).includes(peer.editKey));
 assert.equal((await call('/build-budgets',report,owner.editKey)).status,409);
 assert.equal((await call('/build-budgets',{...report,expectedRevision:1,costs:{ai:0,assets:0,other:0}},owner.editKey)).status,201);
 result=(await call('/build-budgets')).data.items[0];assert.equal(result.cashUsd,0);assert.equal(result.recommendations,0);assert.equal(result.revision,2);
 assert.equal((await call(route,{creatorId:peer.profile.id,tested:true,expectedRevision:1},peer.editKey)).status,409);
 assert.equal((await call(`/build-budgets/${entry.id}/withdraw`,{creatorId:peer.profile.id,expectedRevision:2},peer.editKey)).status,404);
 await call('/creator-profiles/'+owner.profile.id,{name:'Owner',projects:[],showActivity:false,showWork:true},owner.editKey,'PUT');
 assert.equal((await call('/build-budgets')).data.items.length,0);
 assert.equal((await call('/build-budgets',report,owner.editKey)).status,400);
 await call(`/build-budgets/${entry.id}/withdraw`,{creatorId:owner.profile.id,expectedRevision:2},owner.editKey);
 assert.equal((await call('/build-budgets')).data.items.length,0);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
