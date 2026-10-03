import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const root=mkdtempSync(path.join(tmpdir(),'learning-http-'));
process.env.CREATOR_HUB_DATA_DIR=root;
const {createApp}=await import('../app.mjs');
const {lessonFields}=await import('../learningLoop.mjs');
after(()=>rmSync(root,{recursive:true,force:true}));
test('HTTP owner isolation, publication discovery, private evidence exclusion and withdrawal',async()=>{
 const server=createApp().listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 async function call(route,body,key){const response=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(key?{Authorization:`Bearer ${key}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:response.status,cache:response.headers.get('cache-control'),body:await response.json()};}
 try{
  const {body:owner}=await call('/api/creator-profiles',{name:'Trial creator',projects:[]});
  const {body:other}=await call('/api/creator-profiles',{name:'Other creator',projects:[]});
  const {body:project}=await call('/api/projects',{title:'Trial project',description:'Isolated validation project',ecosystem:'creative'});
  const creatorId=owner.profile.id, key=owner.editKey;
  assert.equal((await call('/api/learning/lessons?creatorId='+creatorId)).status,403);
  assert.equal((await call('/api/learning/lessons?creatorId='+creatorId,undefined,other.editKey)).status,403);
  const input={creatorId,projectId:project.project.id,source:{kind:'agent',reference:'PRIVATE_SESSION_REF',excerpt:'PRIVATE_EXCERPT'},content:Object.fromEntries(lessonFields.map(field=>[field,`HTTP trial ${field}`]))};
  assert.equal((await call('/api/learning/lessons',{...input,projectId:'missing'},key)).status,404);
  const created=await call('/api/learning/lessons',input,key);assert.equal(created.status,201);assert.equal(created.cache,'no-store');
  let lesson=created.body;
  assert.equal((await call(`/agent-skills/${lesson.id}/bundle.json`)).status,404);
  assert.equal((await call(`/api/learning/lessons/${lesson.id}/review`,{creatorId:other.profile.id,expectedRevision:1,sanitized:true,evidenceChecked:true,note:'not mine'},other.editKey)).status,404);
  lesson=(await call(`/api/learning/lessons/${lesson.id}/review`,{creatorId,expectedRevision:1,sanitized:true,evidenceChecked:true,note:'inspected public draft'},key)).body;
  lesson=(await call(`/api/learning/lessons/${lesson.id}/trial`,{creatorId,expectedRevision:lesson.revision,accepted:true,summary:'Isolated route test passed',evidence:'PRIVATE_ARTIFACT',comparison:'Same isolated fixture',baseline:{},result:{}},key)).body;
  lesson=(await call(`/api/learning/lessons/${lesson.id}/publish`,{creatorId,expectedRevision:lesson.revision,shareConfirmed:true},key)).body;
  for(const route of ['/api/learning/published','/api/skill-market','/api/agent-resources?q=HTTP',`/agent-skills/${lesson.id}/bundle.json`]){
   const response=await call(route);assert.equal(response.status,200);const serialized=JSON.stringify(response.body);assert.ok(serialized.includes(lesson.id));assert.ok(!serialized.includes('PRIVATE_'));assert.ok(!serialized.includes(key));
  }
  assert.equal((await fetch(base+`/agent-skills/${lesson.id}/SKILL.md`)).status,200);
  assert.equal((await fetch(base+`/agent-skills/${lesson.id}/source.excerpt`)).status,404);
  const download=await call(`/api/skill-market/${lesson.id}/download`,{visitor:'private-check-visitor'});assert.ok(!JSON.stringify(download.body).includes('PRIVATE_'));
  const saved=await call('/api/learning/lessons?creatorId='+creatorId,undefined,key);assert.equal(saved.body.items[0].source.excerpt,'PRIVATE_EXCERPT');
  await call(`/api/learning/lessons/${lesson.id}/retire`,{creatorId,expectedRevision:lesson.revision,reason:'test complete'},key);
  assert.equal((await call(`/agent-skills/${lesson.id}/bundle.json`)).status,404);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
