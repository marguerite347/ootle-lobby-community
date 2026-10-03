import {useEffect,useState} from 'react';
import {Link,Navigate,useSearchParams} from 'react-router-dom';
import {api,type ProjectDetail} from '../api';
import WorkflowEditor from '../WorkflowEditor';
import {seedWorkflow,type Workflow} from '../../../shared/workflow.mjs';
import {STUDIO_RECIPES,STUDIO_STAGES,scaffoldStudio} from '../../../shared/studio.mjs';
import {attachSetupPlan,readSetupPlan} from '../components/toolkitSetup';
import type {SetupPlanV1} from '../../../shared/setupPlan.mjs';
import {studioExportBundle} from '../studioExport';
import './Studio.css';

export default function Studio(){
 const [params,setParams]=useSearchParams();
 const projectId=params.get('project');
 const [recipeId,setRecipeId]=useState('character');
 const [graph,setGraph]=useState<Workflow>(()=>scaffoldStudio('character'));
 const [detail,setDetail]=useState<ProjectDetail|null>(null);
 const [title,setTitle]=useState('My character studio');
 const [brief,setBrief]=useState('');
 const [query,setQuery]=useState('');
 const [tab,setTab]=useState('blueprint');
 const [dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false);
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const [savedDraft,setSavedDraft]=useState(false);
 useEffect(()=>{
  if(!projectId)return;
  let active=true;setLoading(true);setError('');
  api.project(projectId).then(value=>{if(!active)return;setDetail(value);setSavedDraft(!value.project.release);setTitle(value.project.title);setBrief(value.project.description||'');setGraph(value.state?.workflow||seedWorkflow(value.state));setDirty(false);})
   .catch(reason=>{if(active)setError(reason.message);}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[projectId]);
 function editGraph(value:Workflow){setGraph(value);setDirty(true);setNotice('');}
 function chooseRecipe(id:string){
  if(dirty||projectId)return;
  setRecipeId(id);setGraph(scaffoldStudio(id));setNotice('');
 }
 async function save(){
  setBusy(true);setError('');setNotice('');
  try{
   if(projectId&&detail?.state){
    await api.publishProject(projectId,{state:{...detail.state,workflow:graph},expectedHead:detail.head,message:'Save Studio blueprint',author:detail.project.author});
    const saved=await api.project(projectId);
    setDetail(saved);setDirty(false);setSavedDraft(!saved.project.release);setNotice(saved.project.release?'Blueprint saved as a new project version.':'Draft saved. Nothing published yet.');
   }else if(!projectId){
    const result=await api.createProject({title,description:brief,author:'Studio creator',components:[],workflow:graph,setupPlan:readSetupPlan()});
    setDirty(false);setSavedDraft(true);setParams({project:result.project.id});setNotice('Draft saved. Nothing published yet.');
   }
  }catch(reason){setError(reason instanceof Error?reason.message:'Could not save. Your draft is still here.');}
  finally{setBusy(false);}
 }
 function exportBundle(){
  const bundle=studioExportBundle({title,brief,workflow:graph,projectId,expectedHead:detail?.head||null,setupPlan:detail?.state?.setupPlan||readSetupPlan()});
  const url=URL.createObjectURL(new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='studio-blueprint.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('Exported the blueprint and agent handoff. No credentials are included.');
 }
 const indexedNodes=graph.nodes.filter(node=>`${node.title} ${node.role} ${node.purpose}`.toLowerCase().includes(query.toLowerCase()));
 const showRecovery=Boolean(projectId&&(detail?!detail.project.release:savedDraft));
 if(params.has('template')||params.has('idea'))return <Navigate to={'/create/project?'+params.toString()} replace/>;
 return <section className="creator-studio">
  <header className="studio-hero"><div><Link to="/create">← Create</Link><p className="eyebrow">CREATOR STUDIO / EARLY WORKSPACE</p><h1>Okay but<br/><em>what if…</em></h1><p>From the first spark to something playable. Shape the blueprint, find the right parts and keep every decision with your project.</p></div><div className="studio-constellation" aria-hidden="true"><span>IDEA</span><i/><b>✦</b><i/><span>IN PLAY</span></div></header>
  <div className="studio-recipes" aria-label="Studio recipes">{STUDIO_RECIPES.map(recipe=><button key={recipe.id} disabled={dirty||!!projectId} aria-pressed={recipeId===recipe.id&&!projectId} onClick={()=>chooseRecipe(recipe.id)}><small>{recipe.label}</small><strong>{recipe.title}</strong><span>{recipe.description}</span></button>)}</div>
  {(dirty||projectId)&&<p className="faint">Recipe switching is locked to protect this blueprint. <a href="/studio">Open a fresh Studio</a> after saving or exporting your changes.</p>}
  <div className="studio-toolbar"><div><strong>{projectId?title:'NEW BLUEPRINT'}</strong><span>{graph.nodes.length} nodes · {graph.edges.length} connections{dirty?' · Unsaved changes':''}</span></div><div><button className="btn" onClick={exportBundle}>Export agent handoff ↓</button><button className={showRecovery?'btn':'btn primary'} disabled={busy||loading||!title.trim()||!!projectId&&!detail} onClick={save}>{busy?'Saving…':projectId?'Save blueprint':'Create Studio project'}</button></div></div>
  {error&&<p className="notice" role="alert">{error} {projectId&&'Your draft is preserved. Export it before reloading to reconcile a newer version.'}</p>}{notice&&<p className="notice" role="status">{notice}</p>}
  {loading?<p role="status">Opening your project…</p>:<div className="studio-workspace"><aside className="studio-index"><h2>In this blueprint</h2><label className="lbl">Find a node<input className="field" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Rig, audio, preview…"/></label>{indexedNodes.map((node,index)=><button key={node.id} onClick={()=>{setTab('index');setQuery(node.title);}}><small>{String(index+1).padStart(2,'0')} / {node.role}</small><strong>{node.title}</strong></button>)}{!indexedNodes.length&&<p>No matching nodes.</p>}<button className="btn" onClick={()=>setQuery('')}>Show all nodes</button>{projectId&&<Link className="btn" to={`/project/${projectId}`}>Versions & project ↗</Link>}</aside>
   <section className="studio-main"><div className="studio-tabs" role="group" aria-label="Workspace view">{[['blueprint','Blueprint'],['index','Parts & skills'],['access','Access & setup']].map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</div>
    {!projectId&&<div className="studio-brief"><label className="lbl">Project name<input className="field" maxLength={120} value={title} onChange={event=>{setTitle(event.target.value);setDirty(true);}}/></label><label className="lbl">What are we making?<textarea className="field" value={brief} onChange={event=>{setBrief(event.target.value);setDirty(true);}} placeholder="A tiny platformer with a springy robot, one great jump and a spectacular victory."/></label></div>}
    {tab==='blueprint'&&<WorkflowEditor graph={graph} onChange={editGraph} resources={detail?.state||{components:[]}}/>}
    {tab==='index'&&<><label className="lbl">Search blueprint parts<input className="field" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Rig, audio, preview…"/></label><div className="studio-parts">{indexedNodes.map(node=>{const stage=STUDIO_STAGES[node.id.replace('studio-','')];const term=stage?.query||node.title;return <article key={node.id}><small>{node.role.toUpperCase()} · PLANNED</small><h2>{node.title}</h2><p>{node.purpose}</p><div><Link to={`/skills?q=${encodeURIComponent(term)}`}>Find matching skills ↗</Link><Link to={`/explore?q=${encodeURIComponent(term)}`}>Find resources ↗</Link>{stage&&<Link to={stage.path==='/create/assets'&&projectId?`/create/assets?project=${projectId}`:stage.path}>Open workbench ↗</Link>}</div>{node.resourceId&&<Link to={`/resource/${encodeURIComponent(node.resourceId)}`}>Attached resource ↗</Link>}</article>;})}{!indexedNodes.length&&<p>No matching nodes. Clear your search to see the blueprint.</p>}</div></>}
    {tab==='access'&&<div className="studio-access"><h2>Connect only what your project needs.</h2><p>This workspace scaffolds and saves blueprints. It does not yet run model jobs, auto-rig meshes or retarget animations. Connections below are setup routes, not verified accounts.</p><SetupAccess plan={detail?.state?.setupPlan} projectId={projectId} head={detail?.head||null} onAttached={async()=>{if(!projectId)return;const value=await api.project(projectId);setDetail(value);setSavedDraft(!value.project.release);}}/>{[['Hugging Face','Model discovery is available. Hosted inference needs a scoped token, compatible endpoint and compute budget.','/explore?source=huggingface'],['fal / Meshy','Managed 3D generation needs your fal account and a server-side adapter. Execution is not connected.','/agent-start'],['OpenRouter','Agent planning and code assistance need a scoped key and an authorized agent runtime. Execution is not connected.','/agent-start'],['Rigging & animation','Start with compatible rigged assets. Auto-rigging needs a worker; retargeting and engine import need a deformation check.','/skills?q=animation'],['Audio / Envato','Bring your own provider access or licensed downloads. Review one short sample before spending on a batch.','/skills?category=audio']].map(([name,description,path])=><article key={name}><strong>{name}</strong><p>{description}</p><Link to={path}>Setup & resources ↗</Link></article>)}<Link className="btn" to="/create">Open project toolkit & setup wizard ↗</Link><p className="faint">Agents: ask your creator for missing access through their secret manager or provider login. Never paste tokens into nodes or project history.</p></div>}
   </section></div>}
 </section>;
}

function SetupAccess({plan,projectId,head,onAttached}:{plan?:SetupPlanV1;projectId:string|null;head:string|null;onAttached:()=>void}){
 const [notice,setNotice]=useState('');
 async function attach(){
  if(!projectId)return;
  try{await attachSetupPlan(projectId,head,readSetupPlan());setNotice('Setup plan saved on this project. Statuses are user-reported, not verified. Nothing was published as a playable.');onAttached();}
  catch(error){setNotice(error instanceof Error?error.message:'Could not attach the setup plan.');}
 }
 return <div className="studio-plan">{plan?<><h2>Attached setup</h2><p>{plan.engine} · {plan.target}. User-reported, not verified. This blueprint does not publish a playable.</p><ul>{Object.entries(plan.statuses).map(([id,status])=><li key={id}>{id}: {status}</li>)}</ul></>:<p>No setup plan is attached yet.</p>}{projectId&&<button type="button" className="btn" onClick={attach}>Attach setup to this project</button>}<Link className="btn" to={projectId?`/create?setupProject=${encodeURIComponent(projectId)}`:'/create'}>Set up this build in the toolkit ↗</Link><p role="status">{notice}</p></div>;
}
