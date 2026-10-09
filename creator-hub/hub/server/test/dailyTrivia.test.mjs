import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import express from 'express';
import {createDailyTrivia,dailyTriviaRouter,isLocalRequest,QUESTIONS,questionForDay,MULTIPLIERS,SUPER_SPINS,selectSuperFactor,superSpinTable,maxDailyPathPercent} from '../dailyTrivia.mjs';

function fixture(t){
 const root=mkdtempSync(path.join(tmpdir(),'hub-trivia-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 let time=Date.UTC(2026,8,23,12);
 const options={now:()=>time,random:max=>max-1};
 const game=createDailyTrivia(root,options),id=game.register();
 return {root,options,game,id,advance(ms){time+=ms;},start(){return game.mutate(id,'start');},answer(round){return {roundId:round.id,optionId:round.options.find(option=>option.text===QUESTIONS[questionForDay(Math.floor(time/86400000))][1][0]).id};}};
}
test('answers stay server-side; repeated start cannot reset deadline',t=>{
 const f=fixture(t);assert.equal(f.game.get(f.id).round,null);const first=f.start();f.advance(1000);
 assert.deepEqual(f.start().round,first.round);assert.equal('correct' in first.round.options[0],false);assert.equal('correctAnswer' in first.round,false);
});
test('answer and spin are idempotent and survive service restart',t=>{
 const f=fixture(t),start=f.start();f.advance(2000);const input=f.answer(start.round);
 const win=f.game.mutate(f.id,'answer',input);assert.equal(win.balance,150);
 assert.equal(f.game.mutate(f.id,'answer',input).balance,150);
 const spun=f.game.mutate(f.id,'spin',{roundId:start.round.id});assert.equal(spun.balance,750);assert.equal(spun.round.total,750);
 assert.deepEqual(f.game.mutate(f.id,'spin',{roundId:start.round.id}),spun);
 assert.equal(createDailyTrivia(f.root,f.options).get(f.id).balance,750);
});
test('late, incorrect and implausibly fast answers cannot earn or unlock a spin',t=>{
 for(const elapsed of [100,20001]){
  const f=fixture(t),start=f.start();f.advance(elapsed);const result=f.game.mutate(f.id,'answer',f.answer(start.round));
  assert.equal(result.balance,0);assert.equal(result.phase,'lost');assert.throws(()=>f.game.mutate(f.id,'spin',{roundId:start.round.id}),/Win today/);
 }
 const f=fixture(t),start=f.start();f.advance(1500);const correct=f.answer(start.round);
 const wrong=start.round.options.find(option=>option.id!==correct.optionId);
 assert.equal(f.game.mutate(f.id,'answer',{roundId:start.round.id,optionId:wrong.id}).phase,'lost');
 assert.equal(f.game.mutate(f.id,'answer',correct).balance,0);
});
test('malformed options and foreign rounds reject; slow correct answer earns base only',t=>{
 const f=fixture(t),start=f.start();
 for(const optionId of [undefined,null,0,{},'forged'])assert.throws(()=>f.game.mutate(f.id,'answer',{roundId:start.round.id,optionId}),/Choose one/);
 assert.throws(()=>f.game.mutate(f.id,'answer',{roundId:'other',optionId:start.round.options[0].id}),/no longer/);
 f.advance(9000);assert.equal(f.game.mutate(f.id,'answer',f.answer(start.round)).balance,100);
});
test('UTC rollover creates a new attempt while preserving balance and rejecting old round',t=>{
 const f=fixture(t),start=f.start();f.advance(1000);f.game.mutate(f.id,'answer',f.answer(start.round));f.advance(86400000);
 assert.equal(f.game.get(f.id).phase,'ready');assert.equal(f.game.get(f.id).balance,150);
 assert.throws(()=>f.game.mutate(f.id,'spin',{roundId:start.round.id}),/no longer/);
 assert.notEqual(f.start().round.id,start.round.id);
});
test('a resolved round hides live options and keeps the unpaid spin empty', t => {
 const session = fixture(t);
 const start = session.start();
 session.advance(2000);
 const won = session.game.mutate(session.id, 'answer', session.answer(start.round));
 assert.equal(won.phase, 'won');
 assert.equal(Object.hasOwn(won.round, 'options'), false);
 assert.equal(Object.hasOwn(won.round, 'question'), false);
 assert.equal(won.round.spinIndex, null);
 assert.equal(won.round.base, 150);
 assert.equal(won.round.total, 150);
});
test('all six equally likely wheel slots correspond to the disclosed odds',()=>{
 assert.deepEqual([...MULTIPLIERS].sort(),[1,1,2,2,3,5]);
});
test('HTTP sessions reject cross-origin writes and duplicate parallel answers credit once',async t=>{
 const f=fixture(t),app=express();app.use(express.json());app.use('/api/daily-trivia',dailyTriviaRouter(f.root,f.options));
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>server.close());
 const url=`http://127.0.0.1:${server.address().port}/api/daily-trivia`;
 const session=await fetch(url+'/start',{method:'POST',headers:{'x-hub-trivia':'1'}});const cookie=session.headers.get('set-cookie').split(';')[0];
 assert.match(session.headers.get('set-cookie'),/HttpOnly/);assert.equal(session.headers.get('cache-control'),'no-store');
 const post=(action,body={},headers={})=>fetch(url+'/'+action,{method:'POST',headers:{cookie,'content-type':'application/json','x-hub-trivia':'1',...headers},body:JSON.stringify(body)});
 assert.equal((await post('start',{}, {origin:'https://unrelated.example'})).status,403);
 assert.equal((await post('start',{}, {origin:'https://unrelated.example','x-forwarded-host':'unrelated.example','x-forwarded-proto':'https'})).status,403);
 const start=await (await post('start')).json();f.advance(1000);
 const results=await Promise.all([post('answer',f.answer(start.round)),post('answer',f.answer(start.round))]);
 for(const response of results)assert.equal((await response.json()).balance,150);
 const spins=await Promise.all([post('spin',{roundId:start.round.id}),post('spin',{roundId:start.round.id})]);
 for(const response of spins)assert.equal((await response.json()).balance,750);
});
test('configured HTTPS origin supports a full round behind an HTTP proxy without trusting forwarded origins',async t=>{
 const session=fixture(t),app=express();
 const publicOrigin='https://ootle-lobby-preview.vercel.app';
 app.use(express.json());
 app.use('/api/daily-trivia',dailyTriviaRouter(session.root,{...session.options,publicOrigin}));
 const server=app.listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 t.after(()=>server.close());
 const url=`http://127.0.0.1:${server.address().port}/api/daily-trivia`;
 const initial=await fetch(url+'/start',{method:'POST',headers:{'x-hub-trivia':'1',origin:publicOrigin}});
 const cookie=initial.headers.get('set-cookie').split(';')[0];
 const post=(action,body={},headers={})=>fetch(url+'/'+action,{
  method:'POST',headers:{cookie,'content-type':'application/json','x-hub-trivia':'1',origin:publicOrigin,...headers},
  body:JSON.stringify(body),
 });
 for(const origin of ['https://unrelated.example','null','http://ootle-lobby-preview.vercel.app','https://ootle-lobby-preview.vercel.app.evil.example']){
  assert.equal((await post('start',{}, {origin,'x-forwarded-host':'unrelated.example','x-forwarded-proto':'https'})).status,403);
 }
 assert.equal((await post('start',{}, {'x-hub-trivia':''})).status,403);
 const started=await post('start');
 assert.equal(started.status,200);
 const round=(await started.json()).round;
 session.advance(1500);
 const won=await post('answer',session.answer(round));
 assert.equal(won.status,200);
 assert.equal((await won.json()).balance,150);
 const spun=await post('spin',{roundId:round.id});
 assert.equal(spun.status,200);
 assert.equal((await spun.json()).balance,750);
 const completed=await post('decline',{roundId:round.id});
 assert.equal(completed.status,200);
 assert.equal((await completed.json()).phase,'complete');
 const restored=await fetch(url,{headers:{cookie}});
 const state=await restored.json();
 assert.equal(state.phase,'complete');
 assert.equal(state.balance,750);
 assert.equal((await (await post('spin',{roundId:round.id})).json()).balance,750);
});

test('reset clears today and takes back only today’s winnings',t=>{
 const f=fixture(t),first=f.start();f.advance(1000);f.game.mutate(f.id,'answer',f.answer(first.round));
 f.advance(86400000);const second=f.start();f.advance(1000);f.game.mutate(f.id,'answer',f.answer(second.round));
 assert.equal(f.game.mutate(f.id,'spin',{roundId:second.round.id}).balance,900);
 const cleared=f.game.reset(f.id);
 assert.equal(cleared.phase,'ready');assert.equal(cleared.round,null);assert.equal(cleared.balance,150);
 const again=f.start();assert.notEqual(again.round.id,second.round.id);
 assert.throws(()=>f.game.mutate(f.id,'spin',{roundId:second.round.id}),/no longer/);
});
test('local-request check rejects public hosts, proxies and remote sockets',()=>{
 const req=(host,remoteAddress='127.0.0.1',forwarded)=>({socket:{remoteAddress},get:name=>({host,'X-Forwarded-For':forwarded})[name]});
 assert.equal(isLocalRequest(req('localhost:4300')),true);
 assert.equal(isLocalRequest(req('[::1]:4300','::1')),true);
 assert.equal(isLocalRequest(req('lobby.example')),false);
 assert.equal(isLocalRequest(req('localhost:4300','192.168.1.20')),false);
 assert.equal(isLocalRequest(req('localhost:4300','127.0.0.1','203.0.113.9')),false);
});
test('HTTP reset is offered and allowed only for requests from this machine',async t=>{
 const f=fixture(t),app=express();app.use(express.json());app.use('/api/daily-trivia',dailyTriviaRouter(f.root,f.options));
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>server.close());
 const url=`http://127.0.0.1:${server.address().port}/api/daily-trivia`;
 const session=await fetch(url+'/start',{method:'POST',headers:{'x-hub-trivia':'1'}});const cookie=session.headers.get('set-cookie').split(';')[0];
 assert.equal((await session.json()).canReset,true);
 const post=(action,headers={})=>fetch(url+'/'+action,{method:'POST',headers:{cookie,'content-type':'application/json','x-hub-trivia':'1',...headers},body:'{}'});
 const start=await (await post('start')).json();assert.equal(start.phase,'playing');
 assert.equal((await post('reset',{'x-forwarded-for':'203.0.113.9'})).status,403);
 const reset=await post('reset');assert.equal(reset.status,200);assert.equal((await reset.json()).phase,'ready');
});

function scripted(t,spinIndex,ticket=0){
 const root=mkdtempSync(path.join(tmpdir(),'hub-trivia-super-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 let time=Date.UTC(2026,8,23,12);
 const options={now:()=>time,random:max=>max===6?spinIndex:max===100?ticket:0};
 const game=createDailyTrivia(root,options);
 const id=game.register();
 return {root,options,game,id,advance(ms){time+=ms;},start(){return game.mutate(id,'start');},answer(round){return {roundId:round.id,optionId:round.options.find(option=>option.text===QUESTIONS[questionForDay(Math.floor(time/86400000))][1][0]).id};}};
}
function bankedFive(session){
 const start=session.start();session.advance(2000);
 session.game.mutate(session.id,'answer',session.answer(start.round));
 return session.game.mutate(session.id,'spin',{roundId:start.round.id});
}

test('super odds are ours and sum to 100',()=>{
 assert.deepEqual(SUPER_SPINS.map(row=>row.percent),[60,25,12,3]);
 assert.equal(SUPER_SPINS.reduce((sum,row)=>sum+row.percent,0),100);
 assert.deepEqual(superSpinTable().map(row=>row.effective),[5,10,25,50]);
 assert.equal(maxDailyPathPercent(),0.5);
 assert.equal(selectSuperFactor(0),1);
 assert.equal(selectSuperFactor(59),1);
 assert.equal(selectSuperFactor(60),2);
 assert.equal(selectSuperFactor(84),2);
 assert.equal(selectSuperFactor(85),5);
 assert.equal(selectSuperFactor(96),5);
 assert.equal(selectSuperFactor(97),10);
 assert.equal(selectSuperFactor(99),10);
});

test('a non-5× stage spin still closes the vault and rejects Super',t=>{
 const session=scripted(t,0);
 const spun=bankedFive(session);
 assert.equal(spun.phase,'complete');
 assert.equal(spun.round.effectiveMultiplier,1);
 assert.equal(spun.round.total,150);
 assert.equal(spun.balance,150);
 assert.throws(()=>session.game.mutate(session.id,'super',{roundId:spun.round.id}),/5× wedge/);
 assert.equal(session.game.get(session.id).balance,150);
});

test('decline and reload keep the banked 5× and a later Super does not pay',t=>{
 const session=scripted(t,5,99);
 const offer=bankedFive(session);
 assert.equal(offer.phase,'super');
 assert.equal(offer.balance,750);
 assert.equal(offer.round.total,750);
 assert.equal(offer.round.superFactor,null);
 const declined=session.game.mutate(session.id,'decline',{roundId:offer.round.id});
 assert.equal(declined.phase,'complete');
 assert.equal(declined.round.superDeclined,true);
 assert.equal(declined.balance,750);
 assert.deepEqual(session.game.mutate(session.id,'decline',{roundId:offer.round.id}),declined);
 assert.throws(()=>session.game.mutate(session.id,'super',{roundId:offer.round.id}),/already declined/);
 const restored=createDailyTrivia(session.root,session.options).get(session.id);
 assert.equal(restored.phase,'complete');
 assert.equal(restored.balance,750);
 assert.equal(restored.round.total,750);
});

test('S=1 keeps 5×, S=2 settles 10×, and a retry does not pay again',t=>{
 const kept=scripted(t,5,0);
 const offer=bankedFive(kept);
 const same=kept.game.mutate(kept.id,'super',{roundId:offer.round.id});
 assert.equal(same.round.superFactor,1);
 assert.equal(same.round.effectiveMultiplier,5);
 assert.equal(same.balance,750);
 assert.deepEqual(kept.game.mutate(kept.id,'super',{roundId:offer.round.id}),same);
 const mid=scripted(t,5,60);
 const opened=bankedFive(mid);
 const settled=mid.game.mutate(mid.id,'super',{roundId:opened.round.id});
 assert.equal(settled.round.superFactor,2);
 assert.equal(settled.round.effectiveMultiplier,10);
 assert.equal(settled.round.total,1500);
 assert.equal(settled.balance,1500);
 assert.equal(mid.game.mutate(mid.id,'super',{roundId:opened.round.id}).balance,1500);
 assert.equal(mid.game.mutate(mid.id,'decline',{roundId:opened.round.id}).balance,1500);
});

test('S=10 settles a 50× vault from a fast or slow base exactly once',t=>{
 for(const [elapsed,base,total] of [[2000,150,7500],[9000,100,5000]]){
  const session=scripted(t,5,97);
  const start=session.start();session.advance(elapsed);
  session.game.mutate(session.id,'answer',session.answer(start.round));
  const offer=session.game.mutate(session.id,'spin',{roundId:start.round.id});
  assert.equal(offer.balance,base*5);
  const settled=session.game.mutate(session.id,'super',{roundId:start.round.id});
  assert.equal(settled.round.superFactor,10);
  assert.equal(settled.round.effectiveMultiplier,50);
  assert.equal(settled.round.total,total);
  assert.equal(settled.balance,total);
  assert.equal(session.game.mutate(session.id,'super',{roundId:start.round.id}).balance,total);
  assert.equal(createDailyTrivia(session.root,session.options).get(session.id).balance,total);
 }
});

test('parallel Super posts credit the 50× outcome once',async t=>{
 const session=scripted(t,5,99);
 const app=express();app.use(express.json());app.use('/api/daily-trivia',dailyTriviaRouter(session.root,session.options));
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>server.close());
 const url=`http://127.0.0.1:${server.address().port}/api/daily-trivia`;
 const cookie=(await fetch(url+'/start',{method:'POST',headers:{'x-hub-trivia':'1'}})).headers.get('set-cookie').split(';')[0];
 const post=(action,body)=>fetch(url+'/'+action,{method:'POST',headers:{cookie,'content-type':'application/json','x-hub-trivia':'1'},body:JSON.stringify(body)});
 const start=await (await post('start')).json();session.advance(2000);
 const won=await (await post('answer',session.answer(start.round))).json();
 assert.equal(won.balance,150);
 const offer=await (await post('spin',{roundId:start.round.id})).json();
 assert.equal(offer.phase,'super');assert.equal(offer.balance,750);
 const supers=await Promise.all([post('super',{roundId:start.round.id}),post('super',{roundId:start.round.id})]);
 for(const response of supers){
  const body=await response.json();
  assert.equal(body.balance,7500);
  assert.equal(body.round.total,7500);
 }
});
