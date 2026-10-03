import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyReview,reconcileReview,validateReview,renderBlockers,stages} from '../../shared/productionReview.mjs';
function ready(){const value=emptyReview();for(const id of stages) Object.assign(value.gates[id],{content:'criteria',artifact:'v1',reviewer:'reviewer'});return value;}
test('reject malformed boards and unknown metrics instead of treating them as zero',()=>{
 for(const value of [null,false,[],{}, {version:1,gates:null,attempts:[]}]) assert.throws(()=>validateReview(value));
 const value=ready();value.attempts=[{shot:'one',provider:'p',unit:'credits',cost:null,minutes:null,corrections:null,artifact:'v1',feedback:'',result:'rejected'}];
 assert.equal(validateReview(value).attempts[0].cost,null);
 for(const cost of [-1,'2',false,Infinity]) assert.throws(()=>validateReview({...value,attempts:[{...value.attempts[0],cost}]}));
});
test('cannot preapprove a new board or skip saved upstream gates',()=>{
 const value=ready();value.gates.brief.status='approved';assert.throws(()=>reconcileReview(value));
 const next=ready();next.gates.brief.status='approved';next.gates.storyboard.status='approved';assert.throws(()=>reconcileReview(next,ready()));
});
test('sequential decisions permit render; changed exact artifact invalidates downstream',()=>{
 let previous=ready();
 for(const id of stages){const next=structuredClone(previous);next.gates[id].status='approved';next.gates[id].reviewer='reviewer';previous=reconcileReview(next,previous);}
 assert.deepEqual(renderBlockers(previous),[]);
 const next=structuredClone(previous);next.gates.storyboard.artifact='v2';const changed=reconcileReview(next,previous);
 assert.equal(changed.gates.brief.status,'approved');for(const id of stages.slice(1)) assert.equal(changed.gates[id].status,'pending');assert.equal(renderBlockers(changed).length,2);
});
test('short proof is allowed after script and storyboard but full render still waits',()=>{
 let previous=ready();for(const id of stages.slice(0,2)){const next=structuredClone(previous);next.gates[id].status='approved';next.gates[id].reviewer='reviewer';previous=reconcileReview(next,previous);}
 assert.deepEqual(renderBlockers(previous,'proof'),[]);assert.equal(renderBlockers(previous).length,1);
});
