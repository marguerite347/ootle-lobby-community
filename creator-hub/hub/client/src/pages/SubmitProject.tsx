import {useEffect,useRef,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {LISTING_CONTESTS, listingContest} from '../../../shared/listingContests.mjs';
import './SubmitProject.css';

type Receipt={id:string;receivedAt:string;status:string};
type Fields={destination:string;title:string;creator:string;summary:string;projectUrl:string;repoUrl:string;forumUrl:string;website:string;consent:boolean};
export default function SubmitProject(){
  const [params]=useSearchParams();
  const octoberClosed=params.get('contest')==='october' && LISTING_CONTESTS['october-2026'].closed;
  const [fields,setFields]=useState<Fields>({destination:params.get('contest')==='november'?'november-2026':'community',title:'',creator:'',summary:'',projectUrl:'',repoUrl:'',forumUrl:'',website:'',consent:false});
  const [available,setAvailable]=useState<boolean|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState<Receipt|null>(null);
  const requestId=useRef(crypto.randomUUID());
  const notice=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(octoberClosed)return;const controller=new AbortController();fetch('/api/project-submissions/config',{signal:controller.signal}).then(r=>r.json()).then(c=>setAvailable(c.available===true)).catch(e=>{if(e.name!=='AbortError')setAvailable(false);});return()=>controller.abort();},[octoberClosed]);
  useEffect(()=>{if(receipt||error)notice.current?.focus();},[receipt,error]);
  function update<K extends keyof Fields>(key:K,value:Fields[K]){setFields(previous=>({...previous,[key]:value}));setError('');}
  async function submit(e:React.FormEvent){
    e.preventDefault();if(busy)return;setBusy(true);setError('');
    try{
      const config=await fetch('/api/project-submissions/config',{signal:AbortSignal.timeout(15000)}).then(r=>r.json());
      if(!config.available)throw Error('Submissions are temporarily unavailable. Your details are still here; try again shortly.');
      const response=await fetch('/api/project-submissions',{method:'POST',headers:{'Content-Type':'application/json','X-Lobby-Submission':'1'},body:JSON.stringify({...fields,clientId:requestId.current,challenge:config.challenge}),signal:AbortSignal.timeout(15000)});
      const result=await response.json();
      if(!response.ok)throw Error(result.error||'We couldn’t confirm your submission. Please retry.');
      if(!result.receipt?.id)throw Error('We couldn’t confirm your submission. Please retry.');
      setReceipt(result.receipt);
    }catch(e){setError(e instanceof Error&&e.name!=='TimeoutError'&&e.name!=='TypeError'?e.message:'We couldn’t confirm your submission. Your details are still here; retry to check and save it.');}
    finally{setBusy(false);}
  }
  const contest=listingContest(fields.destination);
  const forum=contest?.forumUrl||LISTING_CONTESTS['november-2026'].forumUrl;
  if(octoberClosed)return <div className="project-submit-page">
    <header><Link className="project-submit-back" to="/">Back to the Lobby</Link><h1>October submissions<br/><em>are closed.</em></h1><p>Browse the submitted projects, or join the November MVP contest.</p></header>
    <div className="project-submit-closed-links"><Link className="season-button" to="/#october-submissions">View October projects</Link><Link to="/challenges/november-mvp">See the November contest</Link></div>
  </div>;
  return <div className="project-submit-page">
    <header><Link className="project-submit-back" to="/">Back to the Lobby</Link><h1>Share your <em>build.</em></h1><p>Made something with Tari? Send it in for a spot in the Lobby.</p></header>
    {receipt?<div className="project-submit-receipt" ref={notice} tabIndex={-1} role="status"><p className="project-submit-kicker">Submission received</p><h2>{fields.title}</h2><p>Your project is awaiting review. A publication date hasn’t been assigned yet.{contest?' Contest eligibility is decided through the official forum entry.':''}</p><p className="project-submit-reference">Your reference <code>{receipt.id}</code></p><Link className="season-button" to="/">Back to the Lobby</Link></div>:
    <form onSubmit={submit} className="project-submit-form">
      <fieldset disabled={busy}><legend className="sr-only">Project details</legend>
      <div className="project-submit-destinations"><label><input type="radio" name="destination" value="community" checked={!contest} onChange={()=>update('destination','community')}/>Community project</label><label><input type="radio" name="destination" value="november-2026" checked={fields.destination==='november-2026'} onChange={()=>update('destination','november-2026')}/>November MVP entry</label></div>
      {contest&&<ol className="project-submit-contest-steps">
        <li><strong>Post your entry on the forum.</strong><p>New here? <a href="https://community.tari.com/signup" target="_blank" rel="noreferrer">Create a forum account</a>. Then <a href={forum} target="_blank" rel="noreferrer">reply to the official contest thread</a> with {contest.requirements}.</p></li>
        <li><label>Share your forum post here<input name="forumUrl" type="url" required maxLength={1500} aria-describedby="contest-post-help" placeholder="Paste the link to your reply" value={fields.forumUrl} onChange={e=>update('forumUrl',e.target.value)}/></label><p id="contest-post-help">Use the link icon on your reply to copy its link. Add the listing details below for the Lobby.</p></li>
      </ol>}
      <div className="project-submit-fields"><label>Project name<input name="title" required minLength={2} maxLength={100} value={fields.title} onChange={e=>update('title',e.target.value)}/></label><label>Your name or handle<input name="creator" required maxLength={80} autoComplete="nickname" value={fields.creator} onChange={e=>update('creator',e.target.value)}/></label></div>
      <label>What does it do?<textarea name="summary" required minLength={20} maxLength={1200} rows={3} placeholder="A few sentences about your project and how it uses Tari." value={fields.summary} onChange={e=>update('summary',e.target.value)}/></label>
      <label>Project link<input name="projectUrl" type="url" required maxLength={1500} placeholder={fields.destination==='november-2026'?"https://your-working-mvp.com":"https://your-project.com or your public repository"} value={fields.projectUrl} onChange={e=>update('projectUrl',e.target.value)}/></label>
      <label>Source code{!contest&&<span>Optional</span>}<input name="repoUrl" type="url" required={Boolean(contest)} maxLength={1500} placeholder="https://github.com/you/your-project" value={fields.repoUrl} onChange={e=>update('repoUrl',e.target.value)}/></label>
      {!contest&&<label>Creator post<span>Optional</span><input name="forumUrl" type="url" maxLength={1500} placeholder="A forum or social post introducing your project" value={fields.forumUrl} onChange={e=>update('forumUrl',e.target.value)}/></label>}
      <label className="project-submit-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={e=>update('website',e.target.value)}/></label>
      <label className="project-submit-consent"><input type="checkbox" required checked={fields.consent} onChange={e=>update('consent',e.target.checked)}/>I can share these project details and links publicly.</label>
      <p className="project-submit-note">Your submission stays private during review. Please use public links only.</p>
      </fieldset>
      {error&&<div className="project-submit-error" role="alert" ref={notice} tabIndex={-1}>{error}</div>}
      {available===false&&<p role="status">Submissions are temporarily unavailable. You can still <a href={forum} target="_blank" rel="noreferrer">post a contest entry on the forum</a>.</p>}
      <button className="season-button" type="submit" disabled={busy||available!==true}>{busy?'Sending…':available===null?'Loading form…':'Send for review'}</button>
    </form>}
  </div>;
}
