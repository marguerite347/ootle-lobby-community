import test from 'node:test';
import assert from 'node:assert/strict';
import {buildToolkit,rankToolkit,toolkitTerms} from '../buildToolkit.mjs';
test('matching lesson finds puzzle guidance and excludes unmatched resources',()=>{
 const terms=toolkitTerms('Make a matching literacy lesson');
 const ranked=rankToolkit([{id:'puzzle',title:'Puzzle game',description:'pairing'},{id:'racing',title:'Racing'}],terms);
 assert.deepEqual(ranked.map(item=>item.id),['puzzle']);
});
test('selected foundation drives recommendations and brief requires evidence',()=>{
 const data=buildToolkit([{id:'base',title:'Godot platformer',type:'starter',tags:['physics']},{id:'art',title:'Godot pixel art',type:'asset'}],{resourceId:'base'});
 assert.equal(data.selected,'Godot platformer');assert.equal(data.resources.assets[0].id,'art');
 assert.ok(data.skills.length);assert.match(data.brief,/BUILD_PLAN.md/);assert.match(data.brief,/actually read/);assert.match(data.brief,/working route alone/);
});
test('malformed and unknown contexts fail explicitly',()=>{
 for(const idea of [null,12,{},[], 'x'.repeat(601)])assert.throws(()=>buildToolkit([],{idea}),{status:400});
 assert.throws(()=>buildToolkit([],{resourceId:'missing'}),{status:404});
 assert.equal(buildToolkit([],{idea:'zxqv'}).resources.tools.length,0);
});
test('engine-specific suggestions exclude competing engines and partial word matches',()=>{
 const items=[{id:'godot',title:'Godot movement'},{id:'phaser',title:'Phaser platformer'},{id:'generic',title:'Platformer physics'},{id:'partial',title:'Partners starting guide'}];
 assert.deepEqual(rankToolkit(items,toolkitTerms('Godot platformer')).map(item=>item.id).sort(),['generic','godot']);
 assert.equal(rankToolkit([items[3]],['art']).length,0);
});

test('rolled prose does not recommend unrelated engines or generic-word packages',()=>{
 const data=buildToolkit([
  {id:'noise',type:'tool',title:'One-file C libraries'},
  {id:'wrong',type:'starter',title:'Luanti browser world'},
  {id:'right',type:'library',title:'Phaser Arcade Physics'},
 ],{idea:'Using Phaser, build one browser scene with clear feedback'});
 assert.deepEqual(data.resources.tools.map(item=>item.id),['right']);
 assert.equal(data.resources.foundations.length,0);
 assert.equal(rankToolkit([{id:'three',title:'Three.js movement'}],['godot','movement']).length,0);
});
test('explicit vanilla canvas games avoid wrong-engine packages and unnecessary editor setup',()=>{
 const data=buildToolkit([
  {id:'wrong',type:'starter',title:'Godot arena survival'},
  {id:'pygame',type:'library',title:'Pygame orbital physics'},
  {id:'right',type:'library',title:'Canvas orbital physics'},
 ],{idea:'A vanilla Canvas orbital arena survival game'});
 assert.equal(data.setup.engineId,'canvas');
 assert.deepEqual(data.resources.tools.map(item=>item.id),['right']);
 assert.equal(data.resources.foundations.length,0);
 assert.ok(data.skills.every(item=>!/(godot|pygame|unity|unreal)/i.test(item.id+' '+item.title)));
 assert.match(data.brief,/supports it without a video/);
 assert.ok(data.skills.some(item=>item.id==='gamedev-game-feel'));
 assert.ok(data.skills.some(item=>item.id==='gamedev-game-ui-ux'));
 assert.ok(data.skills.every(item=>!item.title.includes('Emotional Canvas')));
});

test('commercial study references remain usable creative starting points', () => {
 const result=buildToolkit([{id:'reference',title:'Reference game',type:'learn',referenceOnly:true}], {resourceId:'reference',idea:'Phaser card experiment'});
 assert.equal(result.selected,'Reference game');
 assert.match(result.brief,/Creative starting point: Reference game/);
 assert.match(result.brief,/internal playable experiment/);
 assert.ok(!result.brief.includes('Selected foundation: Reference game'));
});
