import test from 'node:test';
import assert from 'node:assert/strict';
import {superWedges,superOutcomes,superLanding} from '../../client/public/wheel-lab/super-disc.js';
import {superSpinTable} from '../dailyTrivia.mjs';
test('isolated Super preview uses equal wedges and banked multipliers',()=>{
 assert.equal(superWedges.length,12);
 assert.equal(superWedges.filter(value=>value===1).length,8);
 assert.deepEqual(superWedges.flatMap((value,index)=>value>1?[index]:[]),[0,3,6,9]);
 assert.deepEqual(superOutcomes.map(row=>row.factor),[1,2,5,10,20]);
 for(const row of superOutcomes){
  assert.equal(row.total,5*row.factor);
  assert.ok(Math.abs(row.percent-superWedges.filter(value=>value===row.factor).length/12*100)<1e-9);
 }
 assert.ok(Math.abs(superOutcomes.reduce((sum,row)=>sum+row.percent,0)-100)<1e-9);
 // The isolated preview must not silently change server-backed reward odds.
 assert.deepEqual(superSpinTable().map(row=>row.percent),[60,25,12,3]);
});
test('every scripted landing selects its matching beveled wedge',()=>{
 superOutcomes.forEach((row,index)=>{
  const wedge=Math.round((superLanding(index)+Math.PI/60)/(Math.PI/6));
  assert.equal(superWedges[wedge],row.factor);
 });
});
