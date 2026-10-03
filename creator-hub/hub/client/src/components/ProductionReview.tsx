import {useState} from 'react';
import {emptyReview,stages,stageTitles,renderBlockers,type ProductionReview as Review,type ReviewGate,type ReviewAttempt} from '../../../shared/productionReview.mjs';
import './ProductionReview.css';
const draft=():ReviewAttempt=>({shot:'',provider:'',unit:'',cost:null,minutes:null,corrections:null,artifact:'',feedback:'',result:'pending'});
export default function ProductionReview({value,onChange,projectId,onSave,busy}:{value?:Review;onChange:(review:Review)=>void;projectId:string;onSave:()=>void;busy:boolean}) {
 const [attempt,setAttempt]=useState(draft);
 if(!value)return <section className="panel mt16"><h3>Creative review</h3><p>Agree on the story, shots and a short proof before producing a complete cut.</p><button className="btn" onClick={()=>onChange(emptyReview())}>Add production review board</button></section>;
 const blockers=renderBlockers(value);
 function editGate(id:string,patch:Partial<ReviewGate>){
  const next=structuredClone(value!);Object.assign(next.gates[id],patch);
  if('content'in patch||'artifact'in patch||patch.status==='changes')for(const key of stages.slice(stages.indexOf(id)+(patch.status==='changes'?1:0))){next.gates[key].status='pending';next.gates[key].reviewer='';}
  onChange(next);
 }
 return <section id="production-review" className="panel mt16 production-review">
  <span className="badge">CREATIVE CONTROL · SAVE STATE TO KEEP CHANGES</span><h2>Make the small decisions first.</h2><button className="btn primary" disabled={busy} onClick={onSave}>Save review and project state</button>
  <p>Review the exact artifact at each stage. Changing content or its version reopens downstream approvals. A decision does not spend credits or start generation.</p>
  <p className="review-status" role="status">{blockers.length?`Full render on hold: ${blockers.join(' · ')}`:'Ready for a full render. Final creative approval remains separate.'}</p>
  <p className="muted">This board travels with project history and forks. Keep private logs, credentials and license certificates out. <a href={`/skills/learning-loop?project=${encodeURIComponent(projectId)}`}>Private lesson review ↗</a></p>
  <div className="review-gates">{stages.map((id,index)=>{const gate=value.gates[id];return <article key={id}>
   <span className="badge">0{index+1} / {gate.status}</span><h3>{stageTitles[id]}</h3>
   <label>Brief / acceptance criteria<textarea value={gate.content} maxLength={12000} onChange={e=>editGate(id,{content:e.target.value})}/></label>
   <label>Exact artifact or version<input value={gate.artifact} maxLength={2000} placeholder="Storyboard v2, sample URL or content hash" onChange={e=>editGate(id,{artifact:e.target.value})}/></label>
   {/^https?:\/\//i.test(gate.artifact)&&<a href={gate.artifact} target="_blank" rel="noreferrer">Open review artifact ↗</a>}
   <label>Feedback / what needs to change<textarea value={gate.feedback} maxLength={4000} onChange={e=>editGate(id,{feedback:e.target.value})}/></label>
   <label>Reviewer<input value={gate.reviewer} maxLength={120} onChange={e=>editGate(id,{reviewer:e.target.value})}/></label>
   <div className="row"><button className="btn" onClick={()=>editGate(id,{status:'changes'})}>Needs changes</button><button className="btn primary" disabled={!gate.content.trim()||!gate.artifact.trim()||!gate.reviewer.trim()||!stages.slice(0,index).every(key=>value.gates[key].status==='approved')} onClick={()=>editGate(id,{status:'approved'})}>Approve this version</button></div>
  </article>})}</div>
  <h3 className="mt24">Generation ledger</h3><p>One entry per attempt. Blank measurements mean unknown. Keep provider credit units separate. Save rejected attempts too.</p>
  <div className="attempts">{value.attempts.map((item,index)=><article key={index}><strong>{item.shot} · {item.result}</strong><p>{item.artifact}</p><small>{item.provider} · {item.cost===null?'Cost unknown':`${item.cost} ${item.unit}`} · {item.minutes===null?'Time unknown':`${item.minutes} minutes`} · {item.corrections===null?'Corrections unknown':`${item.corrections} corrections`}</small><label>Result<select value={item.result} onChange={e=>onChange({...value,attempts:value.attempts.map((entry,i)=>i===index?{...entry,result:e.target.value as ReviewAttempt['result']}:entry)})}><option value="pending">Awaiting review</option><option value="accepted">Accepted</option><option value="rejected">Rejected / wasted generation</option></select></label><label>Feedback<textarea maxLength={4000} value={item.feedback} onChange={e=>onChange({...value,attempts:value.attempts.map((entry,i)=>i===index?{...entry,feedback:e.target.value}:entry)})}/></label></article>)}</div>
  <form className="attempt-form" onSubmit={e=>{e.preventDefault();onChange({...value,attempts:[...value.attempts,attempt]});setAttempt(draft());}}>
   {(['shot','provider','unit','artifact','feedback'] as const).map(key=><label key={key}>{key}<input maxLength={key==='feedback'?4000:key==='artifact'?2000:key==='unit'?80:160} value={attempt[key]} onChange={e=>setAttempt({...attempt,[key]:e.target.value})}/></label>)}
   {(['cost','minutes','corrections'] as const).map(key=><label key={key}>{key}<input type="number" min="0" step={key==='corrections'?'1':'any'} value={attempt[key]??''} onChange={e=>setAttempt({...attempt,[key]:e.target.value===''?null:Number(e.target.value)})}/></label>)}
   <button className="btn" disabled={value.attempts.length>=200||!attempt.shot.trim()||attempt.cost!==null&&(!attempt.provider.trim()||!attempt.unit.trim())}>Record attempt</button>
  </form><p className="muted">Agents read state.productionReview through the project API and run production preflight before a full render. Decisions are recorded attestations, not authenticated identities. This board does not intercept external provider calls.</p>
 </section>;
}
