import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const tmp=mkdtempSync(path.join(tmpdir(),'creator-loop-'));
process.env.CREATOR_HUB_DATA_DIR=tmp;
const {createApp}=await import('../app.mjs');
const projects=await import('../projects.mjs');
projects.ensureStore();
after(()=>rmSync(tmp,{recursive:true,force:true}));
test('configure -> save -> reload -> version -> fork retains pinned recipe',async()=>{
 const server=createApp().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 const post=(url,body)=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 try{
  const invalid=await post('/api/recipes/token-rewarded-counter/projects',{title:'Bad',config:{rewardPerIncrement:-1}});assert.equal(invalid.status,400);
  assert.equal(projects.list().length,0);
  const created=await post('/api/recipes/token-rewarded-counter/projects',{title:'My Riff',author:'Creator',config:{rewardPerIncrement:7,tokenSymbol:'PLAY'}});assert.equal(created.status,201);
  const {project,head}=await created.json();
  assert.equal((await post(`/api/projects/${project.id}/publish`,{state:{components:[],recipe:{}},expectedHead:head})).status,400);
  assert.equal((await post(`/api/projects/${project.id}/publish`,{state:{components:[],recipe:{recipe:{id:'x',version:'1',title:'x'},parameters:{},components:[],adapter:false}},expectedHead:head})).status,400);
  const saved=await projects.detail(project.id);assert.equal(saved.state.recipe.parameters.rewardPerIncrement,7);
  assert.equal(saved.state.recipe.adapter.status,'required-not-implemented');
  assert.equal(saved.state.recipe.components[0].revision.length,40);
  await projects.publish(project.id,{state:{...saved.state,notes:'Reviewed the setup'},expectedHead:head});
  const updated=await projects.detail(project.id);assert.deepEqual(updated.state.recipe,saved.state.recipe);
  const graph = {...updated.state.workflow, nodes:[...updated.state.workflow.nodes,{id:'ai-tool',role:'ai',title:'Concept art',purpose:'Generate backgrounds',x:20,y:30}]};
  await assert.rejects(projects.publish(project.id,{state:{...updated.state,workflow:graph}}),/expectedHead/);
  await projects.publish(project.id,{state:{...updated.state,workflow:graph},expectedHead:updated.head});
  const graphed=await projects.detail(project.id);assert.deepEqual(graphed.state.workflow,graph);
  // Legacy writers that omit the field must not delete the graph.
  const {workflow,...legacy}=graphed.state;
  await projects.publish(project.id,{state:legacy,expectedHead:graphed.head});
  assert.deepEqual((await projects.detail(project.id)).state.workflow,graph);
  const fork=await projects.fork(project.id,{fromRef:graphed.head,title:'Riff again',author:{name:'Second creator'}});
  const forked=await projects.detail(fork.project.id);assert.deepEqual(forked.state.recipe,saved.state.recipe);
  assert.equal(forked.project.forkedAtRef,graphed.head);assert.deepEqual(forked.state.workflow,graph);
  assert.equal((await post(`/api/projects/${project.id}/publish`,{state:saved.state,expectedHead:head})).status,409);
 }finally{await new Promise(r=>server.close(r));}
});
