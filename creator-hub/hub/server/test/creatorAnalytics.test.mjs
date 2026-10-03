import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createCreatorAnalytics} from '../creatorAnalytics.mjs';
test('analytics requires consent, deduplicates, excludes PII and keeps completion separate from verified builds',()=>{
 const root=mkdtempSync(path.join(os.tmpdir(),'creator-metrics-'));
 try{
  const service=createCreatorAnalytics(root),now=new Date('2026-09-22');
  const input={id:'event-1234567890123456',session:'session-1234567890123',type:'tutorial_start',subject:'start-here',consent:true,email:'private@example.org'};
  assert.throws(()=>service.record({...input,consent:false},now),/consent/);
  assert.throws(()=>service.record({...input,type:'verified_build'},now),/Unknown/);
  service.record(input,now);assert.equal(service.record(input,now).duplicate,true);
  service.record({...input,id:'event-2234567890123456',type:'tutorial_complete'},now);
  const summary=service.summary(now);assert.equal(summary.totalRetained,2);assert.equal(summary.learning.completionRate,1);
  assert.ok(!readFileSync(path.join(root,'creator-analytics.json'),'utf8').includes('private@example.org'));
  assert.equal(service.summary(new Date('2026-09-30')).metrics[0].previous,1);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('completions without a matching start are excluded from the funnel denominator',()=>{
 const root=mkdtempSync(path.join(os.tmpdir(),'creator-metrics-'));
 try{const service=createCreatorAnalytics(root);service.record({id:'event-1234567890123456',session:'session-1234567890123',subject:'start-here',type:'tutorial_complete',consent:true});assert.equal(service.summary().learning.completionRate,null);}finally{rmSync(root,{recursive:true,force:true});}
});
test('clear activity is scoped to supplied browser sessions and blocks in-flight replay',()=>{
 const root=mkdtempSync(path.join(os.tmpdir(),'creator-clear-'));
 try{
  const service=createCreatorAnalytics(root),event={id:'event-1234567890123456',session:'session-1234567890123',type:'project_open',subject:'one',consent:true};
  service.record(event);service.record({...event,id:'event-2234567890123456',session:'session-2234567890123'});
  for(const value of [null,'all',[false],['bad']])assert.throws(()=>service.clearHistory(value));
  assert.equal(service.clearHistory([event.session]).removed,1);assert.equal(service.summary().totalRetained,1);
  assert.equal(service.record({...event,id:'event-3234567890123456'}).cleared,true);assert.equal(service.summary().totalRetained,1);
 }finally{rmSync(root,{recursive:true,force:true});}
});
