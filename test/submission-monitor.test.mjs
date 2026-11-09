import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {monitorContest} from '../scripts/monitor-contest.mjs';
import {monitorSubmissions,submissionSources,saveSubmissionReport} from '../scripts/monitor-submissions.mjs';

const stamp='2026-11-09T14:00:00Z';
const source=id=>({id:`topic-${id}`,threadUrl:`https://community.tari.com/t/contest/${id}`,entries:[]});
const post=(id,number=2)=>({id,post_number:number,post_type:1,username:'builder',created_at:stamp,updated_at:stamp,cooked:'<p>New work and <code>https://example.com/article</code></p>'});
test('daily source inventory includes every build contest and creator registry',()=>{
  assert.deepEqual(submissionSources().map(s=>s.id).sort(),['creator-launch-2026','first-to-launch-2026','november-2026','october-2026']);
});
test('November pagination follows its own topic and discovers a new project',async()=>{
  const calls=[];
  const report=await monitorContest({contest:source(520),read:async url=>{
    calls.push(url);
    return calls.length===1?{id:520,post_stream:{stream:[1,3],posts:[{id:1,post_type:1,post_number:1}]}}:{post_stream:{posts:[post(3)]}};
  }});
  assert.match(calls[1],/\/520\/posts\.json/);
  assert.equal(report.candidates[0].review,'new');
  assert.equal(report.candidates[0].sourceUrl,'https://community.tari.com/t/contest/520/2');
});
test('creator posts, including code-formatted links, remain visible and edits are requeued',async()=>{
  const contest={...source(503),entries:[{sourceUrl:'https://community.tari.com/t/contest/503/2',updatedAt:stamp}]};
  const report=await monitorContest({contest,read:async()=>({id:503,post_stream:{stream:[2,3],posts:[{...post(2),updated_at:'2026-11-09T15:00:00Z'},post(3,3)]}})});
  assert.deepEqual(report.candidates.map(p=>p.review),['updated','new']);
  assert.ok(!JSON.stringify(report).includes('example.com'));
  const unchanged=await monitorContest({contest,read:async()=>({id:503,post_stream:{stream:[2],posts:[post(2)]}})});
  assert.equal(unchanged.candidates[0].review,'listed');
});
test('a failed topic keeps the overall scan incomplete without losing successful new submissions',async()=>{
  const report=await monitorSubmissions({sources:[source(520),source(503)],read:async url=>{
    if(url.includes('/503.'))throw Error('HTTP 429');
    return {id:520,post_stream:{stream:[2],posts:[post(2)]}};
  }});
  assert.equal(report.complete,false);assert.equal(report.summary.sourcesFailed,1);
  assert.equal(report.summary.newPosts,1);assert.equal(report.failures[0].contestId,'topic-503');
});
test('incomplete pagination and removed listed posts cannot masquerade as unchanged coverage',async()=>{
  await assert.rejects(monitorContest({contest:source(520),read:async()=>({id:520,post_stream:{stream:[2],posts:[]}})}),/Incomplete/);
  const removed='https://community.tari.com/t/contest/520/9';
  const report=await monitorContest({contest:{...source(520),entries:[{sourceUrl:removed,updatedAt:stamp}]},read:async()=>({id:520,post_stream:{stream:[2],posts:[post(2)]}})});
  assert.deepEqual(report.missingListedSources,[removed]);
});
test('rejects unrelated topic destinations before fetching',async()=>{
  await assert.rejects(monitorContest({contest:{...source(520),threadUrl:'https://example.com/t/contest/520'},read:async()=>{throw Error('must not fetch');}}),/official Tari/);
});
test('a failed read cannot overwrite the last complete report and an empty inventory cannot pass',async()=>{
  await assert.rejects(monitorSubmissions({sources:[]}),/must not be empty/);
  const directory=mkdtempSync(join(tmpdir(),'lobby-submission-monitor-'));
  try{
    const path=join(directory,'report.json');
    saveSubmissionReport({complete:true,checkedAt:stamp},path);
    saveSubmissionReport({complete:false,failures:['HTTP 429']},path);
    assert.deepEqual(JSON.parse(readFileSync(path,'utf8')),{complete:true,checkedAt:stamp});
    assert.equal(JSON.parse(readFileSync(`${path}.partial`,'utf8')).complete,false);
  }finally{rmSync(directory,{recursive:true,force:true});}
});
