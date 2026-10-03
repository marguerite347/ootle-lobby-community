import {test} from 'node:test';
import http from 'node:http';
import assert from 'node:assert/strict';
import {calendarItems,createMarketingCalendar,localCalendarRequest} from '../marketingCalendar.mjs';
const card = {id:'card1',name:'Launch',url:'https://trello.com/c/abcd1234/launch',due:'2026-09-25T02:00:00Z',start:null,idList:'list1',labels:[{name:'Social'}]};
const lists = [{id:'list1',name:'Planned'}];
test('keeps dates, links, list names and undated cards; excludes archived',()=>{
 const items=calendarItems([card,{...card,id:'undated',due:null},{...card,id:'archived',closed:true}],lists);
 assert.equal(items.length,2);assert.equal(items[0].list,'Planned');assert.equal(items[1].due,null);assert.equal(items[0].complete,false);
 assert.throws(()=>calendarItems([{...card,url:'javascript:alert(1)'}],lists));
 assert.throws(()=>calendarItems([{...card,due:'not-a-date'}],lists));
});
test('unconfigured source reports connection needed without invented data',async()=>{
 const get=createMarketingCalendar({env:{},snapshotReader:()=>null,fetchImpl:()=>{throw Error('must not fetch');}});
 assert.equal((await get()).status,'not-connected');assert.deepEqual((await get()).items,[]);
});
test('deduplicates reads, refreshes edits and removals, retains labelled stale data on failure',async()=>{
 let clock=0,calls=0,fail=false,cards=[card];
 const get=createMarketingCalendar({env:{TRELLO_API_KEY:'secret-key',TRELLO_API_TOKEN:'secret-token'},now:()=>clock,fetchImpl:async url=>{
  calls++;if(fail)throw Error('secret-token');return new Response(JSON.stringify(url.pathname.includes('cards')?cards:lists));
 }});
 const results=await Promise.all([get(),get()]);assert.equal(calls,2);assert.equal(results[0].status,'connected');
 clock=61_000;cards=[{...card,name:'Edited'}];assert.equal((await get()).items[0].title,'Edited');
 clock=122_000;fail=true;const stale=await get();assert.equal(stale.status,'stale');assert.equal(stale.items[0].title,'Edited');assert(!JSON.stringify(stale).includes('secret'));
 clock=183_000;fail=false;cards=[];assert.deepEqual((await get()).items,[]);
});
test('private calendar rejects remote clients and nonlocal hosts',()=>{
 assert(localCalendarRequest({socket:{remoteAddress:'127.0.0.1'},headers:{host:'127.0.0.1:4198'}}));
 assert(!localCalendarRequest({socket:{remoteAddress:'127.0.0.1'},headers:{host:'public.example.com'}}));
 assert(!localCalendarRequest({socket:{remoteAddress:'192.168.1.1'},headers:{host:'localhost'}}));
});
test('HTTP route provides explicit connection state and serves the saved draft',async()=>{
 const {createApp}=await import('../app.mjs');
 const server=createApp().listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 try {
  const origin=`http://127.0.0.1:${server.address().port}`;
  const response=await fetch(`${origin}/api/marketing-calendar`);
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
  const data=await response.json();assert.equal(data.boardUrl,'https://trello.com/b/LrJpBwNN/tari-l2-launch-marketing-calendar');
  assert(!JSON.stringify(data).includes('TRELLO_API_TOKEN'));
  assert((await (await fetch(`${origin}/calendar/draft/`)).text()).includes('Marketing calendar'));
  const remoteHostStatus = await new Promise((resolve,reject)=>{http.get(`${origin}/api/marketing-calendar`,{headers:{Host:'external.example'}},response=>{response.resume();resolve(response.statusCode);}).on('error',reject);});
  assert.equal(remoteHostStatus,403);
 } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
test('connector snapshots load real cards and become stale after missed refreshes',async()=>{
 let clock=Date.parse('2026-09-24T17:00:00Z');
 const snapshot={syncedAt:new Date(clock).toISOString(),lists:[{...lists[0],cards:[card]}]};
 const get=createMarketingCalendar({env:{},now:()=>clock,snapshotReader:()=>snapshot});
 assert.equal((await get()).status,'connected');assert.equal((await get()).items.length,1);
 clock+=16*60_000;assert.equal((await get()).status,'stale');
 snapshot.lists=[];snapshot.syncedAt=new Date(clock).toISOString();assert.deepEqual((await get()).items,[]);
});
