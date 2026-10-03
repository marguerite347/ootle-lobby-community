// Data-only, versioned project graph. Design edges do not execute integrations.
export const ROLES = ['framework', 'tari', 'ai', 'comfyui', 'tool', 'output'];
const fail = message => { const e = new Error(message); e.status = 400; throw e; };
const obj = v => v && typeof v === 'object' && !Array.isArray(v);
const text = (v, max) => typeof v === 'string' && v.length <= max;
const idOK = v => typeof v === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(v);
const keyOK = v => idOK(v) && !['__proto__','constructor','prototype'].includes(v);
export function validateWorkflow(g) {
 if (!obj(g) || g.version !== 1 || !Array.isArray(g.nodes) || !Array.isArray(g.edges) || g.nodes.length>80 || g.edges.length>160) fail('Workflow must be version 1, with at most 80 nodes and 160 connections.');
 const ids=new Set();
 for(const n of g.nodes) {
  if(!obj(n) || !keyOK(n.id) || ids.has(n.id) || !ROLES.includes(n.role) || !text(n.title,120) || !n.title.trim() || !text(n.purpose,2000) || !Number.isFinite(n.x) || !Number.isFinite(n.y) || n.x<0 || n.y<0 || n.x>3000 || n.y>3000) fail('Invalid or duplicate workflow node.');
  ids.add(n.id);
  if(n.resourceId!=null && !text(n.resourceId,300)) fail('Invalid resource reference.');
  if(n.url != null && !text(n.url,2048)) fail('Invalid node URL.');
  if(n.url) { try {const u=new URL(n.url);if(!['http:','https:'].includes(u.protocol)||u.username||u.password||n.url.length>2048) fail('Invalid node URL.');}catch{fail('Node URL must be http(s), without credentials.');} }
  if(n.role==='comfyui') {
   if(!obj(n.comfy) || !text(n.comfy.classType,120) || !n.comfy.classType.trim() || !obj(n.comfy.values) || Object.keys(n.comfy.values).length>80) fail('ComfyUI nodes need a class type and literal inputs.');
   for(const [k,v] of Object.entries(n.comfy.values)) if(!keyOK(k) || !(text(v,10000)||typeof v==='boolean'||(typeof v==='number'&&Number.isFinite(v)))) fail('ComfyUI literal inputs must be text, finite numbers or booleans. Wire connections separately.');
  } else if(n.comfy!=null) fail('Only ComfyUI nodes can contain ComfyUI settings.');
 }
 const edgeIds=new Set(), inputs=new Set();
 for(const e of g.edges) {
  if(!obj(e)||!idOK(e.id)||edgeIds.has(e.id)||!ids.has(e.from)||!ids.has(e.to)||e.from===e.to||!['design','comfy'].includes(e.kind)||!text(e.label,120)) fail('Invalid connection: select two different existing nodes and a unique ID.');
  edgeIds.add(e.id);
  if(e.kind==='comfy') {
   const a=g.nodes.find(n=>n.id===e.from),b=g.nodes.find(n=>n.id===e.to);
   if(a.role!=='comfyui'||b.role!=='comfyui'||!keyOK(e.input)||!Number.isInteger(e.output)||e.output<0||e.output>100) fail('ComfyUI connections require two ComfyUI nodes, an input name and output slot.');
   const target=`${e.to}:${e.input}`;
   if(inputs.has(target)||Object.hasOwn(b.comfy.values,e.input)) fail('An input cannot have multiple sources or both a literal and a connection.'); inputs.add(target);
  }
 }
 // ComfyUI API prompts must be acyclic. Design diagrams can describe feedback loops.
 const visiting=new Set(),done=new Set();
 function visit(id){if(visiting.has(id))fail('ComfyUI connections cannot form a cycle.');if(done.has(id))return;visiting.add(id);for(const e of g.edges.filter(e=>e.kind==='comfy'&&e.from===id))visit(e.to);visiting.delete(id);done.add(id);}
 for(const n of g.nodes)visit(n.id);
 return g;
}
export function seedWorkflow(state) {
 const resources=[...(state?.templateId?[{id:state.templateId,title:state.templateId.split(':').pop().replaceAll('-',' ')}]:[]),...(state?.components||[]),...(state?.recipe?.components||[])];
 const seen=new Set(),nodes=[];
 for(const r of resources) {if(!r.id||seen.has(r.id)||nodes.length>=79)continue;seen.add(r.id);nodes.push({id:`node-${nodes.length}`,role:String(r.id).startsWith('tari-ootle:')?'tari':'framework',title:String(r.title||r.name||r.id).slice(0,120),resourceId:r.id,purpose:'Selected project resource. Describe its role and verify any integration before use.',x:40+(nodes.length%4)*280,y:40+Math.floor(nodes.length/4)*160});}
 return {version:1,nodes,edges:[]};
}
export function removeNode(graph,id) {return {...graph,nodes:graph.nodes.filter(n=>n.id!==id),edges:graph.edges.filter(e=>e.from!==id&&e.to!==id)};}
export function importComfy(prompt,prefix='comfy') {
 if(!obj(prompt)||Array.isArray(prompt.nodes))fail('Use ComfyUI API (prompt) JSON, not the editor workflow format.');
 const entries=Object.entries(prompt).filter(([k])=>!k.startsWith('_'));
 if(!entries.length || entries.length>80)fail('ComfyUI prompt must contain 1-80 nodes.');
 const map=new Map(entries.map(([id],i)=>[id,`${prefix}-${i}`])); const nodes=[],edges=[];
 entries.forEach(([id,n],i)=>{
  if(!obj(n)||!obj(n.inputs)||typeof n.class_type!=='string')fail('Each API node needs class_type and inputs.');
  const values={};
  for(const [key,value] of Object.entries(n.inputs)) {
   if(!keyOK(key))fail('Invalid ComfyUI input name.');
   if(Array.isArray(value)) {
    if(value.length!==2||!map.has(String(value[0]))||!Number.isInteger(value[1]))fail('Unsupported ComfyUI input array or missing source node.');
    edges.push({id:`${prefix}-edge-${edges.length}`,from:map.get(String(value[0])),to:map.get(id),kind:'comfy',label:key,input:key,output:value[1]});
   } else values[key]=value;
  }
  nodes.push({id:map.get(id),role:'comfyui',title:n._meta?.title||n.class_type,purpose:'ComfyUI API node. Runtime/model availability and port types must be checked in ComfyUI.',x:40+(i%4)*280,y:40+Math.floor(i/4)*180,comfy:{classType:n.class_type,values}});
 });
 return validateWorkflow({version:1,nodes,edges});
}
export function exportComfy(graph) {
 validateWorkflow(graph);const prompt={};
 for(const n of graph.nodes.filter(n=>n.role==='comfyui')) {
  const inputs={...n.comfy.values};
  for(const e of graph.edges.filter(e=>e.kind==='comfy'&&e.to===n.id)) inputs[e.input]=[e.from,e.output];
  prompt[n.id]={class_type:n.comfy.classType,inputs,_meta:{title:n.title}};
 }
 if(!Object.keys(prompt).length)fail('Add or import ComfyUI nodes first.');
 return prompt;
}
