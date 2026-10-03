import test from 'node:test';
import assert from 'node:assert/strict';
import {rollToolkit} from '../buildBlueprints.mjs';
import {buildToolkit} from '../buildToolkit.mjs';
import {buildSetup} from '../buildSetup.mjs';

test('rolls produce actionable native components, real skill links and a trial',()=>{
 for(const idea of ['Godot','Phaser','GDevelop']){
  const result=rollToolkit([],{idea},()=>0);
  assert.equal(result.blueprint.components.length,4);assert.ok(result.blueprint.acceptance.length>40);
  assert.ok(result.skills.length>=3);assert.ok(result.skills.every(skill=>skill.instructions.startsWith('/agent-skills/')));
  assert.ok(!result.skills.some(skill=>/threejs/.test(skill.id)));
  for(const skill of result.skills)assert.ok(result.brief.includes(skill.instructions));
  assert.equal(result.setup.engine.toLowerCase(),idea.toLowerCase());
 }
});
test('reroll excludes last combination and the blank picker has multiple engine paths',()=>{
 const first=rollToolkit([],{},()=>0),second=rollToolkit([],{previous:first.blueprint.id},()=>0),last=rollToolkit([],{},count=>count-1);
 assert.notEqual(first.blueprint.id,second.blueprint.id);assert.notEqual(first.blueprint.engine,last.blueprint.engine);
});
test('selected foundation and its engine remain authoritative even with conflicting idea text',()=>{
 const records=[{id:'anchor',title:'Godot space game',ecosystem:'Godot',type:'starter'},{id:'wrong',title:'Unity space',type:'starter'},{id:'right',title:'Godot space art',type:'asset'}];
 const rolled=rollToolkit(records,{resourceId:'anchor',idea:'Unity space'},()=>0);
 assert.equal(rolled.selected,'Godot space game');assert.equal(rolled.blueprint.foundationPreserved,true);assert.equal(rolled.blueprint.engine,'godot');
 const normal=buildToolkit(records,{resourceId:'anchor',idea:'Unity space'});
 assert.equal(normal.setup.engine,'Godot');assert.ok(!normal.resources.foundations.some(item=>item.id==='wrong'));
});
test('unknown foundation stays project-defined and malformed requests fail explicitly',()=>{
 const selected=rollToolkit([{id:'unknown',title:'Unclassified starter',type:'starter'}],{resourceId:'unknown'},()=>0);
 assert.match(selected.idea,/selected foundation/);assert.equal(selected.setup.engine,'Project-defined engine');
 for(const idea of [null,{},[],42,'x'.repeat(601)])assert.throws(()=>rollToolkit([],{idea}),{status:400});
 assert.throws(()=>rollToolkit([],{resourceId:'missing'}),{status:404});
 assert.throws(()=>rollToolkit([],{previous:[]}),{status:400});
});
test('setup asks only context-relevant services by default and preserves UEFN boundary',()=>{
 const plain=buildSetup('Phaser arcade');assert.deepEqual(plain.enabledProviders,[]);
 const media=buildSetup('Godot with Hugging Face voice and Envato');assert.deepEqual(media.enabledProviders,['huggingface','envato','audio']);
 const uefn=buildSetup('UEFN Unreal island');assert.equal(uefn.engine,'UEFN');assert.match(uefn.requirements.find(item=>item.id==='engine').verify,/do not assume Unreal Blueprint/);
 assert.match(media.agentInstructions,/never request passwords, tokens or cookie exports/);
});
