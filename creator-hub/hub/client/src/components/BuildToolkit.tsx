import {useState} from 'react';
import {Link} from 'react-router-dom';
import './BuildToolkit.css';
import BuildSetupWizard from './BuildSetupWizard';
import type {SetupPlan} from './toolkitSetup';

type Suggestion={id:string;title:string;reason:string;url?:string;instructions?:string;lifecycle?:string};
type Blueprint={id:string;title:string;engine:string;theme:string;components:string[];acceptance:string;foundationPreserved:boolean};
type Toolkit={idea:string;blueprint?:Blueprint;setup:SetupPlan;skills:Suggestion[];resources:Record<string,Suggestion[]>;brief:string;coverage:string};
export function toolkitSearchParams({idea,resourceId,projectId,previous}:{idea:string;resourceId:string;projectId:string;previous:string}){
 return new URLSearchParams({idea,resourceId,projectId,previous});
}
export default function BuildToolkit({initialIdea='',resourceId='',projectId=''}:{initialIdea?:string;resourceId?:string;projectId?:string}){
 const [idea,setIdea]=useState(initialIdea);
 const [data,setData]=useState<Toolkit|null>(null);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');
 const [wizardOpen,setWizardOpen]=useState(false);
 const [generation,setGeneration]=useState(0);
 const [lastRoll,setLastRoll]=useState('');
 const [rollContext,setRollContext]=useState(initialIdea);
 async function recommend(roll=false){
  setBusy(true);setNotice('');setWizardOpen(false);
  try{
   const query=toolkitSearchParams({idea:roll?rollContext:idea,resourceId,projectId,previous:lastRoll});
   const response=await fetch(`/api/build-toolkit${roll?'/roll':''}?${query}`);
   if(!response.ok)throw new Error('Toolkit unavailable. Use the agent setup guide and try again.');
   const result:Toolkit=await response.json();setData(result);setGeneration(value=>value+1);
   if(roll){setIdea(result.idea);setLastRoll(result.blueprint?.id||'');setNotice('New combination ready. Review the structure, then set up your build.');}
  }catch(error){setNotice(error instanceof Error?error.message:'Could not load toolkit.');}finally{setBusy(false);}
 }
 async function copy(){try{await navigator.clipboard.writeText(data!.brief);setNotice('Agent brief copied.');}catch{setNotice('Select and copy the brief below.');}}
 return <details className="build-toolkit"><summary>Build toolkit · Skills, assets &amp; packages for this idea <span aria-hidden="true">＋</span></summary>
  <p>Give your agent a starting kit before it writes code. Include the engine, game mechanic and visual style for better matches.</p>
  <label>Your idea or selected foundation<textarea className="field" value={idea} disabled={busy} maxLength={600} rows={3} onChange={event=>{setIdea(event.target.value);setRollContext(event.target.value);setData(null);setWizardOpen(false);}} placeholder="A Godot platformer with gravity puzzles and pixel art…"/></label>
  <div className="toolkit-actions"><button type="button" className={`btn toolkit-roll ${busy?'is-rolling':''}`} disabled={busy} onClick={()=>void recommend(true)}><span aria-hidden="true">⚄</span> {busy?'Finding a fit…':'Roll an idea'}</button><button type="button" className="btn" disabled={busy||(!idea.trim()&&!resourceId&&!projectId)} onClick={()=>void recommend()}>{busy?'Finding matches…':'Suggest my toolkit →'}</button> <a href="/agent-start">Agent setup guide ↗</a></div>
  {data&&<>{data.blueprint&&<section className="toolkit-blueprint" aria-label="Rolled project blueprint"><div><span className="setup-eyebrow">A SMALL BUILD WITH A CLEAR SHAPE</span><h3>{data.blueprint.title}</h3><p>{data.blueprint.theme}{data.blueprint.foundationPreserved?' · Your selected foundation stays in place.':''}</p></div><ol>{data.blueprint.components.map((component,index)=><li key={component}><b>0{index+1}</b><span>{component}</span>{index<data.blueprint!.components.length-1&&<i aria-hidden="true">→</i>}</li>)}</ol><p><strong>First playable test:</strong> {data.blueprint.acceptance}</p><small>These are component roles to build and verify. Catalog matches below are candidates, not an installed or tested combination.</small></section>}<p className="faint">{data.coverage}</p><div className="build-toolkit-grid">{Object.entries({skills:data.skills,...data.resources}).map(([group,items])=><section key={group}><h3>{group==='tools'?'Tools & packages':group==='foundations'?'Starters & templates':group==='skills'?'Skills to read':'Assets'}</h3>{items.length?items.map(item=><div key={item.id}><a href={item.url||item.instructions!}>{item.title} ↗</a><small>{item.reason}{item.lifecycle?` · ${item.lifecycle}`:''}</small></div>):<p>No specific match. <Link to={group==='skills'?'/skills':'/explore'}>Browse the library →</Link></p>}</section>)}</div><p><strong>Done means playable and discoverable.</strong> Your brief includes preview capture, release registration, restore instructions and evidence of skills used.</p><div className="toolkit-actions"><button type="button" className="btn primary" aria-expanded={wizardOpen} onClick={()=>setWizardOpen(value=>!value)}>{wizardOpen?'Close setup wizard':'Set up this build →'}</button><button type="button" className="btn" onClick={copy}>Copy build brief only</button></div><div hidden={!wizardOpen}><BuildSetupWizard key={generation} plan={data.setup} brief={data.brief} idea={data.idea} projectId={projectId} skills={data.skills.map(skill=>({id:skill.id,title:skill.title}))}/></div><details><summary>Read the full brief</summary><pre>{data.brief}</pre></details></>}
  <p><Link to="/build-feedback">Finished or stuck? Share your build experience →</Link></p>
  <p role="status">{notice}</p>
 </details>;
}
