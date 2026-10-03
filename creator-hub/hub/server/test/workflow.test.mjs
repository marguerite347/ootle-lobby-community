import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateWorkflow,importComfy,exportComfy,removeNode,seedWorkflow} from '../../shared/workflow.mjs';
const example=JSON.parse(readFileSync(new URL('../../../video-templates/comfyui/tari-concept-broll.api.json',import.meta.url)));
test('SDXL API prompt preserves classes and bindings through export/import',()=>{
 const graph=importComfy(example); const round=importComfy(exportComfy(graph));
 assert.equal(round.nodes.length,graph.nodes.length);assert.equal(round.edges.length,graph.edges.length);
 assert.deepEqual(round.nodes.map(n=>n.comfy),graph.nodes.map(n=>n.comfy));
 assert.deepEqual(round.edges.map(e=>[e.from,e.to,e.input,e.output]),graph.edges.map(e=>[e.from,e.to,e.input,e.output]));
});
test('reject unsafe or inconsistent diagrams and editor-format JSON',()=>{
 const graph=importComfy(example);
 assert.throws(()=>importComfy({nodes:[]}));
 assert.throws(()=>validateWorkflow({...graph,nodes:[...graph.nodes,graph.nodes[0]]}));
 assert.throws(()=>validateWorkflow({...graph,edges:[...graph.edges,{...graph.edges[0],id:'bad',from:'missing'}]}));
 assert.throws(()=>validateWorkflow({...graph,edges:[...graph.edges,{...graph.edges[0],id:'duplicate'}]}));
 for(const change of [{id:'__proto__'},{url:'javascript:alert(1)'},{x:-1}])assert.throws(()=>validateWorkflow({...graph,nodes:[{...graph.nodes[0],...change}]}));
});
test('removing nodes cleans connections and seeding does not invent integrations',()=>{
 const graph=importComfy(example);const id=graph.edges[0].from;
 const clean=removeNode(graph,id);validateWorkflow(clean);assert.ok(clean.edges.every(e=>e.from!==id&&e.to!==id));
 const seeded=seedWorkflow({templateId:'tari-ootle:example',components:[{id:'engine',title:'Game engine'}]});
 assert.equal(seeded.nodes.length,2);assert.equal(seeded.nodes[0].role,'tari');assert.equal(seeded.edges.length,0);
});
