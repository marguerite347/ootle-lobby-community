import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {BlobError,BlobPreconditionFailedError} from '@vercel/blob';
import {createBlobDailyTrivia} from '../dailyTriviaBlob.mjs';
import {dailyTriviaRouter,QUESTIONS,questionForDay} from '../dailyTrivia.mjs';

function fixture() {
 const records=new Map();
 let version=0,time=Date.UTC(2026,9,3,12),conflicts=0,writes=0;
 const client={
  async get(path,options) {
   assert.equal(options.access,'private');
   assert.equal(options.useCache,false);
   const record=records.get(path);
   return record?{stream:new Response(record.body).body,blob:{etag:record.etag}}:null;
  },
  async put(path,body,options) {
   assert.equal(options.access,'private');
   assert.equal(options.addRandomSuffix,false);
   const previous=records.get(path);
   if(previous && options.ifMatch!==previous.etag) {
    conflicts++;
    throw new BlobPreconditionFailedError();
   }
   assert.equal(options.allowOverwrite,Boolean(previous));
   const etag=`"${++version}"`;
   records.set(path,{body,etag});writes++;
   return {etag};
  },
 };
 const instance=()=>createBlobDailyTrivia({token:'test-only',client,now:()=>time,random:max=>max-1});
 return {instance,client,advance(ms){time+=ms;},get conflicts(){return conflicts;},get writes(){return writes;},
  answer(round){return {roundId:round.id,optionId:round.options.find(option=>option.text===QUESTIONS[questionForDay(Math.floor(time/86400000))][1][0]).id};}};
}

test('independent function instances share rounds, settle concurrent requests once and retain the result after restart',async()=>{
 const session=fixture(),first=session.instance(),second=session.instance();
 const id=await first.register();
 const starts=await Promise.all([first.mutate(id,'start'),second.mutate(id,'start')]);
 assert.deepEqual(starts[0].round,starts[1].round);
 session.advance(1500);
 const answers=await Promise.all([first.mutate(id,'answer',session.answer(starts[0].round)),second.mutate(id,'answer',session.answer(starts[0].round))]);
 for(const answer of answers)assert.equal(answer.balance,150);
 const input={roundId:starts[0].round.id};
 const spins=await Promise.all([first.mutate(id,'spin',input),second.mutate(id,'spin',input)]);
 for(const spin of spins)assert.equal(spin.balance,750);
 const supers=await Promise.all([first.mutate(id,'super',input),second.mutate(id,'super',input)]);
 for(const spin of supers)assert.equal(spin.balance,7500);
 const restored=await session.instance().get(id);
 assert.equal(restored.balance,7500);
 assert.equal(restored.phase,'complete');
 const writes=session.writes;
 assert.deepEqual(await second.mutate(id,'super',input),restored);
 assert.equal(session.writes,writes,'idempotent retries do not write again');
 assert.ok(session.conflicts>=4,'each concurrent transition exercised an ETag conflict');
 session.advance(86400000);
 const tomorrow=await session.instance().get(id);
 assert.equal(tomorrow.phase,'ready');
 assert.equal(tomorrow.balance,7500);
});

test('storage failure does not return an award or replace the durable round',async()=>{
 const session=fixture(),game=session.instance(),id=await game.register();
 const started=await game.mutate(id,'start');session.advance(1500);
 const broken=createBlobDailyTrivia({token:'test-only',client:{...session.client,put:async()=>{throw new Error('storage unavailable');}}});
 await assert.rejects(broken.mutate(id,'answer',session.answer(started.round)),/storage unavailable/);
 assert.equal((await game.get(id)).balance,0);
 assert.equal((await game.get(id)).phase,'playing');
});

test('cloud reset removes only today’s winnings, survives reload and allows another round',async()=>{
 const session=fixture(),game=session.instance(),id=await game.register();
 const yesterday=await game.mutate(id,'start');session.advance(1500);
 await game.mutate(id,'answer',session.answer(yesterday.round));
 session.advance(86400000);
 const today=await game.mutate(id,'start');session.advance(1500);
 await game.mutate(id,'answer',session.answer(today.round));
 assert.equal((await game.mutate(id,'spin',{roundId:today.round.id})).balance,900);
 const reset=await session.instance().reset(id);
 assert.equal(reset.balance,150);assert.equal(reset.phase,'ready');assert.equal(reset.round,null);
 assert.deepEqual(await session.instance().get(id),reset);
 assert.equal((await game.reset(id)).balance,150);
 assert.notEqual((await game.mutate(id,'start')).round.id,today.round.id);
});

test('shared testing reset is opt-in and still rejects foreign origins and missing trivia headers',async t=>{
 for(const allowReset of [false,true]) {
  const session=fixture(),app=express();app.use(express.json());
  app.use('/api/daily-trivia',dailyTriviaRouter('',{publicOrigin:'https://lobby.example',game:session.instance(),allowReset}));
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>server.close());
  const url=`http://127.0.0.1:${server.address().port}/api/daily-trivia`;
  const initial=await fetch(url,{headers:{host:'lobby.example','x-forwarded-for':'203.0.113.9'}});
  const cookie=initial.headers.get('set-cookie').split(';')[0];
  assert.equal((await initial.json()).canReset,allowReset);
  const post=(action,headers={})=>fetch(url+'/'+action,{method:'POST',headers:{host:'lobby.example','x-forwarded-for':'203.0.113.9',cookie,origin:'https://lobby.example','x-hub-trivia':'1','content-type':'application/json',...headers},body:'{}'});
  assert.equal((await post('start')).status,200);
  assert.equal((await post('reset',{origin:'https://unrelated.example'})).status,403);
  assert.equal((await post('reset',{'x-hub-trivia':''})).status,403);
  const reset=await post('reset');
  assert.equal(reset.status,allowReset?200:403);
  if(allowReset){assert.equal((await reset.json()).phase,'ready');assert.equal((await post('start')).status,200);}
 }
});

test('a pending conditional write conflict retries against the latest record',async()=>{
 const session=fixture(),game=session.instance(),id=await game.register();
 let attempts=0;
 const racing=createBlobDailyTrivia({token:'test-only',client:{...session.client,put:async(...args)=>{
  if(attempts++===0)throw new BlobError('The conditional request cannot succeed due to a conflicting operation against this resource.');
  return session.client.put(...args);
 }}});
 assert.equal((await racing.mutate(id,'start')).phase,'playing');
 assert.equal(attempts,2);
});

test('unconfigured cloud storage fails closed and asynchronous errors reach the HTTP error handler',async t=>{
 const app=express();
 app.use('/api/daily-trivia',dailyTriviaRouter('',{game:createBlobDailyTrivia()}));
 const server=app.listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));t.after(()=>server.close());
 const response=await fetch(`http://127.0.0.1:${server.address().port}/api/daily-trivia`);
 assert.equal(response.status,503);
 assert.equal(response.headers.get('set-cookie'),null);
});

test('HTTP identity issued by one instance is usable by another with a Secure HttpOnly cookie',async t=>{
 const session=fixture();
 const urls=[];
 for(let index=0;index<2;index++) {
  const app=express();app.use(express.json());
  app.use('/api/daily-trivia',dailyTriviaRouter('',{publicOrigin:'https://lobby.example',game:session.instance()}));
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>server.close());
  urls.push(`http://127.0.0.1:${server.address().port}/api/daily-trivia`);
 }
 const initial=await fetch(urls[0]);
 const header=initial.headers.get('set-cookie');
 assert.match(header,/HttpOnly/);assert.match(header,/Secure/);assert.match(header,/SameSite=Strict/);
 const cookie=header.split(';')[0];
 const start=await fetch(urls[1]+'/start',{method:'POST',headers:{cookie,origin:'https://lobby.example','x-hub-trivia':'1','content-type':'application/json'},body:'{}'});
 assert.equal(start.status,200);
 const state=await start.json();
 const reload=await fetch(urls[0],{headers:{cookie}});
 assert.equal((await reload.json()).round.id,state.round.id);
});
