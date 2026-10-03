import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createLearningLoop,metricDelta,lessonFields} from '../learningLoop.mjs';
import {createSkillMarket} from '../skillMarket.mjs';
const body=()=>Object.fromEntries(lessonFields.map(key=>[key,`Reusable ${key} without private facts.`]));
const input=()=>({projectId:'sample-project',content:body(),source:{kind:'beacon',reference:'private-session-marker',excerpt:'PRIVATE_EVIDENCE_MARKER'}});
const reviewed={sanitized:true,evidenceChecked:true,note:'Compared output to source evidence'};
const trial={accepted:true,summary:'The short export retained the intended balance.',evidence:'PRIVATE_TRIAL_PATH',comparison:'Same ten-second scene and acceptance check',baseline:{corrections:2,credits:0},result:{corrections:0,credits:0}};
function fixture(run){const root=mkdtempSync(path.join(tmpdir(),'learning-'));try{run(createLearningLoop(root),root);}finally{rmSync(root,{recursive:true,force:true});}}

test('review, trial and explicit publication gate a portable skill; private evidence never ships',()=>fixture((loop,root)=>{
 let lesson=loop.create('owner',input());
 assert.equal(loop.publicListings().length,0);assert.equal(loop.bundle(lesson.id),null);
 assert.throws(()=>loop.publish(lesson.id,'owner',{expectedRevision:lesson.revision,shareConfirmed:true}),/successful/);
 assert.throws(()=>loop.review(lesson.id,'intruder',{expectedRevision:1,...reviewed}),/not found/);
 lesson=loop.review(lesson.id,'owner',{expectedRevision:lesson.revision,...reviewed});
 lesson=loop.trial(lesson.id,'owner',{expectedRevision:lesson.revision,...trial});
 assert.deepEqual(metricDelta(lesson.trials[0]),{corrections:-2,wastedGenerations:null,minutes:null,credits:0});
 assert.throws(()=>loop.publish(lesson.id,'owner',{expectedRevision:lesson.revision}),/Confirm publication/);
 lesson=loop.publish(lesson.id,'owner',{expectedRevision:lesson.revision,shareConfirmed:true});
 const bundle=loop.bundle(lesson.id);assert.ok(bundle.files['SKILL.md'].includes('Creator-reported trial'));
 const publicText=JSON.stringify([loop.publicListings(),bundle]);
 for(const privateText of ['PRIVATE_EVIDENCE_MARKER','PRIVATE_TRIAL_PATH','private-session-marker'])assert.ok(!publicText.includes(privateText));
 const market=createSkillMarket(root);assert.ok(market.catalog().listings.some(item=>item.id===lesson.id));
 assert.deepEqual(market.download(lesson.id,'test-visitor-123456').files,bundle.files);
 assert.equal(createLearningLoop(root).list('owner').length,1);
 assert.throws(()=>loop.edit(lesson.id,'owner',{expectedRevision:lesson.revision,content:body()}),/immutable/);
 lesson=loop.retire(lesson.id,'owner',{expectedRevision:lesson.revision,reason:'Superseded by a later test'});
 assert.equal(loop.bundle(lesson.id),null);assert.equal(loop.publicListings().length,0);
}));

test('editing invalidates review; failed trials block publication; stale writes conflict',()=>fixture(loop=>{
 let lesson=loop.create('owner',input());
 lesson=loop.review(lesson.id,'owner',{expectedRevision:1,...reviewed});
 assert.throws(()=>loop.edit(lesson.id,'owner',{expectedRevision:1,content:body()}),/changed/);
 lesson=loop.trial(lesson.id,'owner',{expectedRevision:lesson.revision,...trial,accepted:false});
 assert.throws(()=>loop.publish(lesson.id,'owner',{expectedRevision:lesson.revision,shareConfirmed:true}),/successful/);
 lesson=loop.edit(lesson.id,'owner',{expectedRevision:lesson.revision,content:body()});
 assert.equal(lesson.state,'draft');assert.equal(lesson.review,null);
 assert.throws(()=>loop.trial(lesson.id,'owner',{expectedRevision:lesson.revision,...trial}),/Review/);
}));

test('malformed inputs, credential leakage and fabricated metric types are rejected',()=>fixture(loop=>{
 for(const bad of [null,[],{}, {...input(),source:null},{...input(),content:[]},{...input(),source:{kind:'unknown'}}])assert.throws(()=>loop.create('owner',bad));
 let lesson=loop.create('owner',{...input(),content:{...body(),instructions:'Read /Users/private-person/private-session.txt'}});
 assert.throws(()=>loop.review(lesson.id,'owner',{expectedRevision:1,...reviewed}),/private machine/);
 lesson=loop.edit(lesson.id,'owner',{expectedRevision:1,content:body()});
 lesson=loop.review(lesson.id,'owner',{expectedRevision:lesson.revision,...reviewed});
 for(const bad of [-1,'2',false,Infinity,NaN])assert.throws(()=>loop.trial(lesson.id,'owner',{expectedRevision:lesson.revision,...trial,result:{credits:bad}}));
 assert.equal(loop.list('another').length,0);
}));
