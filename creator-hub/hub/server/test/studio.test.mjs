import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {STUDIO_RECIPES,scaffoldStudio} from '../../shared/studio.mjs';
import {validateWorkflow} from '../../shared/workflow.mjs';
const root=mkdtempSync(path.join(tmpdir(),'studio-test-'));
process.env.CREATOR_HUB_DATA_DIR=root;
const projects=await import('../projects.mjs');
projects.ensureStore();
after(()=>rmSync(root,{recursive:true,force:true}));
test('every recipe scaffolds connected, validated design nodes',()=>{
 for(const recipe of STUDIO_RECIPES){const graph=scaffoldStudio(recipe.id);validateWorkflow(graph);assert.equal(graph.nodes.length,recipe.stages.length);assert.equal(graph.edges.length,graph.nodes.length-1);assert.ok(graph.edges.every(edge=>edge.kind==='design'));}
 assert.throws(()=>scaffoldStudio('missing'),/Unknown/);
});
test('Studio blueprint persists in initial project version and rejects invalid graphs atomically',async()=>{
 const workflow=scaffoldStudio('character');
 const result=await projects.create({title:'Rigged character',workflow,author:{name:'Test'}});
 const detail=await projects.detail(result.project.id);
 assert.deepEqual(detail.state.workflow,workflow);
 const before=projects.list().length;
 await assert.rejects(projects.create({title:'Invalid',workflow:{...workflow,edges:[{id:'bad',from:'missing',to:'studio-brief',kind:'design',label:'bad'}]}}),/Invalid connection/);
 await assert.rejects(projects.create({title:'Null graph',workflow:null}),/Workflow must/);
 assert.equal(projects.list().length,before);
});
test('a nonsecret setup plan survives create and a later save, and secrets are rejected', async () => {
 const plan = {version:1, engine:'Godot', engineId:'godot', target:'Browser', enabledProviders:[], requirements:[{id:'engine', title:'Godot setup', ask:'Which machine?', verify:'Open the project.', url:'/skills?q=Godot', provider:'core'}], statuses:{engine:'ready'}, agentInstructions:'Statuses are user-reported, not verified.', updatedAt:'2026-09-24T00:00:00.000Z', reportedBy:'creator'};
 const created = await projects.create({title:'Loadout project', author:{name:'Test'}, setupPlan:plan, workflow:scaffoldStudio('character')});
 const opened = await projects.detail(created.project.id);
 assert.equal(opened.state.setupPlan.version, 1);
 assert.equal(opened.state.setupPlan.engine, 'Godot');
 assert.equal(opened.state.setupPlan.statuses.engine, 'ready');
 assert.equal(opened.state.workflow.nodes.length, scaffoldStudio('character').nodes.length);
 await projects.publish(created.project.id, {state:{...opened.state, notes:'Still a draft', setupPlan:plan}, expectedHead:created.head, author:{name:'Test'}});
 const saved = await projects.detail(created.project.id);
 assert.equal(saved.state.setupPlan.statuses.engine, 'ready');
 assert.equal(saved.state.notes, 'Still a draft');
 assert.equal(saved.state.workflow.nodes.length, opened.state.workflow.nodes.length);
 await assert.rejects(projects.publish(created.project.id, {state:{...saved.state, notes:'stale clobber'}, expectedHead:created.head}), error => error.status === 409);
 const untouched = await projects.detail(created.project.id);
 assert.equal(untouched.state.notes, 'Still a draft');
 assert.equal(untouched.head, saved.head);
 const before = projects.list().length;
 await assert.rejects(projects.create({title:'Poisoned loadout', author:{name:'Test'}, setupPlan:{...plan, agentInstructions:'paste token=abcdef123456'}}), error => error.status === 400);
 assert.equal(projects.list().length, before);
});
