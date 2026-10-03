import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {editions,createChallenges} from '../challenges.mjs';
test('weekly schedule respects New York midnight and DST',()=>{
 for(const [time,week] of [['2026-09-28T03:59:59Z',1],['2026-09-28T04:00:00Z',2],['2026-11-02T04:59:59Z',6],['2026-11-02T05:00:00Z',7]])assert.equal(editions(new Date(time)).find(e=>e.phase==='open').number,week);
 assert.equal(editions(new Date('2027-09-22')).filter(e=>e.phase==='open').length,1);
});
test('pins evidence, rejects duplicates and closed weeks, grants no payout',()=>{
 const root=mkdtempSync(path.join(os.tmpdir(),'challenge-test-'));
 try{const s=createChallenges(root),now=new Date('2026-09-22'),creator={id:'creator-1'},project={project:{id:'example-123'},head:'abcdef'},input={editionId:'creator-week-1',summary:'Improved the first level',evidenceUrl:'https://example.com/demo'};
 assert.throws(()=>s.submit({...input,evidenceUrl:'javascript:alert(1)'},creator,project,now));
 assert.throws(()=>s.submit({...input,editionId:'creator-week-2'},creator,project,now));
 assert.equal(s.submit(input,creator,project,now).projectRef,'abcdef');
 assert.throws(()=>s.submit(input,creator,project,now),/already submitted/);
 assert.throws(()=>s.submit(input,{id:'other'},project,now),/already submitted/);
 const e=s.list(now).find(e=>e.phase==='open');assert.equal(e.submitted,1);assert.equal(e.verified,0);assert.equal(e.rewardAmount,null);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('entry gallery retains submitted versions without exposing creator identity',()=>{
 const root=mkdtempSync(path.join(os.tmpdir(),'challenge-gallery-'));
 try{
  const store=createChallenges(root);
  const project={project:{id:'project-one'},head:'original-version'};
  store.submit({editionId:'creator-week-1',summary:'A playable loop',evidenceUrl:'https://example.com/demo'},{id:'private-profile-id'},project,new Date('2026-09-22'));
  project.head='new-version';
  const rows=store.submissions();
  assert.equal(rows.length,1);assert.equal(rows[0].projectRef,'original-version');
  assert.equal(rows[0].review,'pending');assert.equal(rows[0].creatorId,undefined);
  assert.deepEqual(createChallenges(root).submissions(),rows);
 }finally{rmSync(root,{recursive:true,force:true});}
});
