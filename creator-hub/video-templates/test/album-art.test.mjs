import{test}from'node:test';import assert from'node:assert/strict';
import{scenes}from'../src/album/scenes.mjs';import{albumFrame}from'../src/album/frame.mjs';
test('every authored album has distinct artwork and visible motion, not title reskins',()=>{
 const art=new Set();assert.equal(Object.keys(scenes).length,157);
 for(const[title,s]of Object.entries(scenes)){
  assert.ok(s.brief.length>45,title);const a=s.draw(0),b=s.draw(Math.PI/2);
  assert.notEqual(a,b,`${title} must animate`);assert.ok(!art.has(a),`${title} duplicates an existing scene`);art.add(a);
  for(const f of [0,24,72,95]){const svg=albumFrame(title,f);assert.ok(!/NaN|undefined|Infinity/.test(svg),title);assert.ok(svg.endsWith('</svg>'));}
 }
});
test('unart-directed resources fail rather than inherit generic fallback',()=>assert.throws(()=>albumFrame('Unknown resource'),/No authored scene/));
