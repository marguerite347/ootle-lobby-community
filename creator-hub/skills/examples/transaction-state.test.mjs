import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyTransaction as classify } from './transaction-state.mjs';
test('main acceptance requires both status and final result', () => {
  assert.equal(classify({status:'Accepted',result:{result:{Accept:{}}}}).state,'accepted');
  for (const r of [{status:'Accepted'}, {result:{result:{Accept:{}}}}, null, {status:'FutureStatus'}]) assert.equal(classify(r).state,'unknown');
});
test('fee-only and rejected outcomes never grant an app reward', () => {
  for (const r of [{status:'OnlyFeeAccepted'}, {status:'Accepted',result:{result:{AcceptFeeRejectRest:[{},'failure']}}}, {status:'Rejected'}, {status:'InvalidTransaction'}, {status:'DryRunFailed'}]) assert.equal(classify(r).state,'failed');
});
test('timeout and simulations are not settlement', () => {
  assert.equal(classify({status:'Accepted',timed_out:true,result:{result:{Accept:{}}}}).state,'unknown');
  assert.equal(classify({status:'DryRun'}).state,'simulated');
  assert.equal(classify({status:'Pending'}).state,'pending');
  assert.equal(classify({status:'Accepted',result:{result:{Accept:{},Reject:'failure'}}}).state,'failed');
});
