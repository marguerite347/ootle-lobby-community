import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLaunchReader,launchTarget,LAUNCH_CONFIG_URL} from '../launchConfig.mjs';
const config=target=>({'ootle-mainnet-launch-at':target,unrelated:'must not be returned'});
const response=data=>({ok:true,json:async()=>data});
test('uses the wallet field and exposes only a normalized target',async()=>{
 let request;
 const read=createLaunchReader({fetcher:async(url,options)=>{request={url,options};return response(config('2026-11-11T12:11:11+01:00'));}});
 assert.deepEqual(await read(),{target:'2026-11-11T11:11:11.000Z'});
 assert.equal(request.url,LAUNCH_CONFIG_URL);assert.equal(request.options.redirect,'error');
});
test('refreshes changed dates after a minute and deduplicates in-flight calls',async()=>{
 let clock=1000,calls=0,date='2026-11-11T11:11:11Z';
 const read=createLaunchReader({now:()=>clock,fetcher:async()=>{calls++;return response(config(date));}});
 const initial=await Promise.all([read(),read()]);assert.equal(calls,1);assert.deepEqual(initial[0],initial[1]);
 date='2026-11-12T15:20:30Z';clock+=59999;assert.equal((await read()).target,initial[0].target);assert.equal(calls,1);
 clock++;assert.equal((await read()).target,'2026-11-12T15:20:30.000Z');assert.equal(calls,2);
});
test('invalid, missing and failed sources never manufacture a launch time; retry recovers',async()=>{
 for(const value of [null,{},config(123),config('tomorrow'),config('2026-11-11T11:11:11'),config('2026-13-11T11:11:11Z')])assert.throws(()=>launchTarget(value));
 let fail=true;
 const read=createLaunchReader({fetcher:async()=>fail?{ok:false}:response(config('2026-11-11T11:11:11Z'))});
 await assert.rejects(read());fail=false;assert.equal((await read()).target,'2026-11-11T11:11:11.000Z');
});
