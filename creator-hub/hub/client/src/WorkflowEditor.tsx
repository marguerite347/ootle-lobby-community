import { useState } from 'react';
import { ROLES, validateWorkflow, seedWorkflow, removeNode, importComfy, exportComfy, type Workflow, type WorkflowNode } from '../../shared/workflow.mjs';

export default function WorkflowEditor({graph,onChange,resources}:{graph:Workflow;onChange:(g:Workflow)=>void;resources:any}) {
 const [selected,select]=useState(''); const [error,setError]=useState('');
 const [role,setRole]=useState('tool'); const [from,setFrom]=useState(''); const [to,setTo]=useState('');
 const [kind,setKind]=useState<'design'|'comfy'>('design'); const [label,setLabel]=useState(''); const [slot,setSlot]=useState(0);
 const [json,setJson]=useState('');
 const node=graph.nodes.find(n=>n.id===selected);
 function commit(next:Workflow){try{validateWorkflow(next);onChange(next);setError('');}catch(e:any){setError(e.message);}}
 function patch(values:Partial<WorkflowNode>){if(node)commit({...graph,nodes:graph.nodes.map(n=>n.id===node.id?{...n,...values}:n)});}
 function download(data:unknown,name:string){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function mergeComfy(data:unknown){const added=importComfy(data,`comfy-${Date.now()}`);const offset=graph.nodes.length?Math.max(...graph.nodes.map(n=>n.y))+180:0;commit({...graph,nodes:[...graph.nodes,...added.nodes.map(n=>({...n,y:n.y+offset}))],edges:[...graph.edges,...added.edges]});}
 function attempt(fn:()=>void){try{setError('');fn();}catch(e:any){setError(e.message);}}
 return <section className="panel mt16">
  <h2>Creation workflow</h2><p className="muted mt8">Map what you are building with and why. Select a node to edit it. Drag its handle to rearrange, or enter coordinates below. Save state records this diagram in project history.</p>
  <p className="faint mt8">Dashed connections are design notes. Solid ComfyUI connections export as API inputs, but have not been executed or checked for port compatibility. Tari connections do not deploy contracts.</p>
  <div className="row mt16" style={{flexWrap:'wrap'}}>
   <select aria-label="New node type" className="field" style={{width:'auto'}} value={role} onChange={e=>setRole(e.target.value)}>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
   <button className="btn" onClick={()=>{const id=`n-${Date.now()}`;commit({...graph,nodes:[...graph.nodes,{id,role,title:`New ${role}`,purpose:'Describe what this does',x:40,y:40,...(role==='comfyui'?{comfy:{classType:'SaveImage',values:{}}}:{})}]});select(id);}}>Add node</button>
   <button className="btn" onClick={()=>{const added=seedWorkflow(resources).nodes.filter(n=>!graph.nodes.some(v=>v.resourceId===n.resourceId));commit({...graph,nodes:[...graph.nodes,...added.map((n,i)=>({...n,id:`resource-${Date.now()}-${i}`}))]});}}>Add missing project resources</button>
   <a className="btn" href="/api/workflows/agent-guide" target="_blank" rel="noreferrer">Agent instructions</a>
  </div>
  {error&&<p role="alert" className="mt8">{error}</p>}
  <div className="workflow-scroll mt16" tabIndex={0} aria-label="Scrollable workflow canvas">
   <div className="workflow-canvas" style={{width:Math.max(1000,...graph.nodes.map(n=>n.x+260)),height:Math.max(380,...graph.nodes.map(n=>n.y+150))}}>
    <svg aria-hidden="true" width="100%" height="100%" style={{position:'absolute',pointerEvents:'none'}}>{graph.edges.map(e=>{const a=graph.nodes.find(n=>n.id===e.from)!,b=graph.nodes.find(n=>n.id===e.to)!;return <g key={e.id}><path d={`M ${a.x+220} ${a.y+55} C ${a.x+280} ${a.y+55}, ${b.x-60} ${b.y+55}, ${b.x} ${b.y+55}`} fill="none" stroke={e.kind==='comfy'?'#b3ed65':'#a499cb'} strokeWidth="2" strokeDasharray={e.kind==='design'?'6 4':undefined}/><text x={(a.x+220+b.x)/2} y={(a.y+b.y)/2+45} fill="currentColor" fontSize="12">{e.label} →</text></g>;})}</svg>
    {graph.nodes.map(n=><div key={n.id} className={`workflow-node ${n.id===selected?'selected':''}`} style={{left:n.x,top:n.y}}>
     <button className="workflow-handle" aria-label={`Move ${n.title}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);select(n.id);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId)){commit({...graph,nodes:graph.nodes.map(v=>v.id===n.id?{...v,x:Math.max(0,Math.min(3000,v.x+e.movementX)),y:Math.max(0,Math.min(3000,v.y+e.movementY))}:v)});}}}>⠿ {n.role}</button>
     <button className="workflow-select" onClick={()=>select(n.id)}><strong>{n.title}</strong><span>{n.purpose}</span></button>
    </div>)}
    {!graph.nodes.length&&<p style={{padding:24}}>Add a framework, Tari template, or AI tool to begin.</p>}
   </div>
  </div>
  {node&&<div className="panel mt16"><h3>Edit {node.title}</h3>
   <label className="lbl">Name<input className="field" value={node.title} onChange={e=>patch({title:e.target.value})}/></label>
   <label className="lbl">Purpose<textarea className="field" value={node.purpose} onChange={e=>patch({purpose:e.target.value})}/></label>
   <label className="lbl">Resource ID<input className="field" value={node.resourceId||''} onChange={e=>patch({resourceId:e.target.value})}/></label>
   <label className="lbl">Source URL<input className="field" defaultValue={node.url||''} key={`${node.id}-url`} onBlur={e=>patch({url:e.target.value})}/></label>
   <div className="row">{(['x','y'] as const).map(axis=><label key={axis}>{axis}<input className="field" type="number" min="0" max="3000" value={node[axis]} onChange={e=>patch({[axis]:Number(e.target.value)})}/></label>)}</div>
   {node.comfy&&<><label className="lbl">ComfyUI class<input className="field" value={node.comfy.classType} onChange={e=>patch({comfy:{...node.comfy!,classType:e.target.value}})}/></label><label className="lbl">Literal inputs JSON (connections belong below)<textarea className="field" rows={6} key={node.id} defaultValue={JSON.stringify(node.comfy.values,null,2)} onBlur={e=>attempt(()=>patch({comfy:{...node.comfy!,values:JSON.parse(e.target.value)}}))}/></label></>}
   <button className="btn mt8" onClick={()=>{commit(removeNode(graph,node.id));select('');}}>Remove node and its connections</button>
  </div>}
  <details className="mt16" open><summary>Connections ({graph.edges.length})</summary>
   <div className="row mt8" style={{flexWrap:'wrap'}}>{[['From',from,setFrom],['To',to,setTo]].map(([name,value,setter])=><label key={String(name)}>{String(name)}<select className="field" value={String(value)} onChange={e=>(setter as (v:string)=>void)(e.target.value)}><option value="">Choose node</option>{graph.nodes.map(n=><option value={n.id} key={n.id}>{n.title}</option>)}</select></label>)}
   <label>Connection type<select className="field" value={kind} onChange={e=>setKind(e.target.value as 'design'|'comfy')}><option value="design">Design note</option><option value="comfy">ComfyUI input</option></select></label>
   <label>{kind==='comfy'?'Target input name':'Purpose'}<input className="field" value={label} onChange={e=>setLabel(e.target.value)}/></label>
   {kind==='comfy'&&<label>Source output slot<input className="field" type="number" min="0" value={slot} onChange={e=>setSlot(Number(e.target.value))}/></label>}
   <button className="btn" onClick={()=>commit({...graph,edges:[...graph.edges,{id:`e-${Date.now()}`,from,to,kind,label,...(kind==='comfy'?{input:label,output:slot}:{})}]})}>Connect</button></div>
   {graph.edges.map(e=><div className="row mt8" key={e.id}><span>{graph.nodes.find(n=>n.id===e.from)?.title} → {graph.nodes.find(n=>n.id===e.to)?.title}: {e.label} ({e.kind})</span><button className="btn small" onClick={()=>commit({...graph,edges:graph.edges.filter(v=>v.id!==e.id)})}>Remove connection</button></div>)}
  </details>
  <details className="mt16"><summary>ComfyUI and agent JSON</summary><p className="muted mt8">Import API-format ComfyUI prompts to add nodes. Export the ComfyUI subset to run in your own configured ComfyUI installation. Models and execution are not included.</p>
   <div className="row mt8" style={{flexWrap:'wrap'}}><button className="btn" onClick={()=>fetch('/api/workflows/comfy-example').then(r=>{if(!r.ok)throw Error('Cannot load example');return r.json();}).then(v=>attempt(()=>mergeComfy(v))).catch(e=>setError(e.message))}>Add SDXL example</button><button className="btn" onClick={()=>attempt(()=>download(exportComfy(graph),'comfy-api.json'))}>Export ComfyUI API</button><button className="btn" onClick={()=>download(graph,'project-workflow.json')}>Export full diagram</button></div>
   <label className="lbl">Paste JSON<textarea className="field" rows={5} value={json} onChange={e=>setJson(e.target.value)}/></label><div className="row"><button className="btn" onClick={()=>attempt(()=>mergeComfy(JSON.parse(json)))}>Add ComfyUI API nodes</button><button className="btn" onClick={()=>attempt(()=>commit(validateWorkflow(JSON.parse(json))))}>Replace full diagram</button></div>
  </details>
 </section>;
}
