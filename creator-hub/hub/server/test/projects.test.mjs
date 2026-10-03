import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Redirect runtime data to an isolated dir BEFORE importing the store.
const tmp = mkdtempSync(path.join(tmpdir(), 'hub-projects-'));
process.env.CREATOR_HUB_DATA_DIR = tmp;
const projects = await import('../projects.mjs');

before(() => projects.ensureStore());
after(() => rmSync(tmp, { recursive: true, force: true }));

test('create -> publish saved states -> real git version history', async () => {
  const { project } = await projects.create({ title: 'Test Game', description: 'd', templateId: 't1', ecosystem: 'tari-ootle', author: { name: 'alice' } });
  await projects.publish(project.id, { state: { templateId: 't1', components: [{ id: 'c1', title: 'Inventory' }], notes: 'a' }, message: 'Add inventory', author: { name: 'alice' } });
  await projects.publish(project.id, { state: { templateId: 't1', components: [], notes: 'b' }, message: 'Token economy', author: { name: 'alice' } });

  const versions = await projects.versions(project.id);
  assert.equal(versions.length, 3, 'three commits: create + two saved states');
  assert.equal(versions[0].subject, 'Token economy');
  assert.equal(versions[2].subject, 'Create project: Test Game');
});

test('fork from an earlier saved state branches lineage without later commits', async () => {
  const { project } = await projects.create({ title: 'Base', templateId: 't', author: { name: 'a' } });
  await projects.publish(project.id, { state: { components: [{ id: 'c1' }], notes: '1' }, message: 'v1', author: { name: 'a' } });
  await projects.publish(project.id, { state: { components: [{ id: 'c2' }], notes: '2' }, message: 'v2', author: { name: 'a' } });

  const versions = await projects.versions(project.id);
  const oldest = versions[versions.length - 1].hash; // the create commit

  const { project: forked } = await projects.fork(project.id, { fromRef: oldest, title: 'Riff', author: { name: 'bob' } });
  assert.equal(forked.forkedFrom, project.id);
  assert.equal(forked.forkedAtRef, oldest);
  assert.equal(forked.author, 'bob');

  const fv = await projects.versions(forked.id);
  // fork marker + the single create commit it forked from; NOT v1/v2.
  assert.ok(fv.some((v) => v.subject.startsWith('Fork of')));
  assert.ok(!fv.some((v) => v.subject === 'v2'), 'fork from oldest must not contain later commit v2');

  const state = await projects.stateAt(forked.id, 'HEAD');
  assert.ok(state, 'forked state readable at HEAD');
});

test('publish to a missing project throws 404', async () => {
  await assert.rejects(() => projects.publish('does-not-exist', { state: {}, author: { name: 'x' } }), (e) => e.status === 404);
});

test('production review persists, rejects stale and malformed saves, resets on fork',async()=>{
 const {emptyReview}=await import('../../shared/productionReview.mjs');
 const {project}=await projects.create({title:'Review project',author:{name:'test'}});
 let before=await projects.detail(project.id);const review=emptyReview();
 review.gates.brief={content:'A concrete script',artifact:'script-v1',status:'pending',reviewer:'',feedback:''};
 await projects.publish(project.id,{state:{...before.state,productionReview:review},expectedHead:before.head,author:{name:'test'}});
 const savedHead=(await projects.detail(project.id)).head;
 await assert.rejects(()=>projects.publish(project.id,{state:{notes:'stale clobber',productionReview:review},expectedHead:before.head}),e=>e.status===409);
 const untouched=await projects.detail(project.id);
 assert.equal(untouched.head,savedHead);
 assert.notEqual(untouched.state.notes,'stale clobber');
 before=untouched;const approved=structuredClone(before.state);approved.productionReview.gates.brief.status='approved';approved.productionReview.gates.brief.reviewer='Test reviewer';
 await projects.publish(project.id,{state:approved,expectedHead:before.head,author:{name:'test'}});
 const saved=await projects.detail(project.id);assert.equal(saved.state.productionReview.gates.brief.status,'approved');
 for(const invalid of [null,false,[],{}])await assert.rejects(()=>projects.publish(project.id,{state:{productionReview:invalid},expectedHead:saved.head}),e=>e.status===400);
 const {project:child}=await projects.fork(project.id,{fromRef:saved.head,title:'Review fork',author:{name:'test'}});
 assert.equal((await projects.detail(child.id)).state.productionReview.gates.brief.status,'pending');
 assert.equal((await projects.detail(project.id)).state.productionReview.gates.brief.status,'approved');
});

test('history deletion requires ownership, confirmation and fresh head; preserves current game and forks',async()=>{
 const {execFileSync}=await import('node:child_process');
 const {project,managementKey}=await projects.create({title:'History control',author:{name:'test'}});
 let before=await projects.detail(project.id);
 await projects.publish(project.id,{state:{...before.state,notes:'middle'},expectedHead:before.head});
 const middle=await projects.detail(project.id);
 await projects.publish(project.id,{state:{...middle.state,notes:'current'},expectedHead:middle.head});
 const current=await projects.detail(project.id);
 const {project:forked}=await projects.fork(project.id,{fromRef:middle.head,title:'Independent fork'});
 const input={action:'delete-version',ref:middle.head,expectedHead:current.head,confirmation:project.id};
 await assert.rejects(()=>projects.manageHistory(project.id,input,'wrong'),e=>e.status===403);
 await assert.rejects(()=>projects.manageHistory(project.id,{...input,confirmation:''},managementKey),e=>e.status===400);
 await assert.rejects(()=>projects.manageHistory(project.id,{...input,expectedHead:middle.head},managementKey),e=>e.status===409);
 await assert.rejects(()=>projects.manageHistory(project.id,{...input,ref:current.head},managementKey),e=>e.status===400);
 await projects.manageHistory(project.id,input,managementKey);
 let result=await projects.detail(project.id);assert.equal(result.versions.length,2);assert.equal(result.state.notes,'current');
 assert.throws(()=>execFileSync('git',['cat-file','-e',middle.head],{cwd:path.join(tmp,'projects',project.id),stdio:'pipe'}));
 assert.equal((await projects.stateAt(forked.id,middle.head)).notes,'middle');
 await projects.manageHistory(project.id,{action:'clear-history',expectedHead:result.head,confirmation:project.id},managementKey);
 result=await projects.detail(project.id);assert.equal(result.versions.length,1);assert.equal(result.state.notes,'current');
 await projects.publish(project.id,{state:{...result.state,notes:'after clearing'},expectedHead:result.head});
 assert.equal((await projects.versions(project.id)).length,2);
 result=await projects.detail(project.id);
 await projects.manageHistory(project.id,{action:'delete-project',expectedHead:result.head,confirmation:project.id},managementKey);
 assert.equal(await projects.detail(project.id),null);assert.ok(await projects.detail(forked.id));
});
