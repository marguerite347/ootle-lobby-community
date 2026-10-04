// INTEGRATION_GAP[WB-PUBLISH] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-publish.
import {useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {publishWorkspace} from './api';
import {publicationError,type PublicationDraft,type Workspace} from './model';
export const emptyDraft=(title:string):PublicationDraft=>({title,summary:'',creator:'',repoUrl:'',demoUrl:'',destination:'community',forumUrl:''});
export default function PublishPanel({workspace,connected,onChange,onExport}:{workspace:Workspace;connected:boolean;onChange:(draft:PublicationDraft)=>void;onExport:()=>void}) {
 const draft=workspace.publication||emptyDraft(workspace.name);
 const [status,setStatus]=useState(''),[busy,setBusy]=useState(false),[published,setPublished]=useState(false);
 const attempt=useRef({payload:'',id:''});
 function change(update:Partial<PublicationDraft>){onChange({...draft,...update});setStatus('');setPublished(false);}
 async function publish(){
  const error=publicationError(draft);if(error){setStatus(error);return;}
  if(!connected){setStatus('Publishing is not connected yet. Download your submission to keep everything ready.');return;}
  const payload=JSON.stringify({workspace,draft});
  if(attempt.current.payload!==payload)attempt.current={payload,id:crypto.randomUUID()};
  setBusy(true);setStatus('Submitting your project…');
  try{
   const result=await publishWorkspace(workspace,draft,attempt.current.id);
   if(result.status==='published'&&result.publication?.status==='published'&&result.publication.destination===draft.destination){setPublished(true);setStatus('Published. Your project is now in the gallery.');}
   else if(result.status==='pending-review'&&result.submissionId){setStatus('Submitted for review. Your project will appear after approval.');}
   else throw new Error('The publishing service did not confirm a publication. Your draft is still saved.');
  }catch(error){setStatus(error instanceof Error?error.message:'Publishing failed. Your draft is still saved.');}finally{setBusy(false);}
 }
 return <div className="wb-publish"><div className="wb-section-label">SHARE YOUR BUILD</div><h1>Publish your project</h1><p>Choose where your project belongs.</p>
  <form onSubmit={event=>{event.preventDefault();void publish();}}>
   <fieldset className="wb-destinations"><legend>Publish to</legend>
    <label className={draft.destination==='community'?'selected':''}><input type="radio" name="destination" checked={draft.destination==='community'} onChange={()=>change({destination:'community'})}/><span><strong>Community Projects</strong><small>Apps, games and experiments outside a contest.</small></span></label>
    <label className={draft.destination==='october-2026'?'selected':''}><input type="radio" name="destination" checked={draft.destination==='october-2026'} onChange={()=>change({destination:'october-2026'})}/><span><strong>October Submissions</strong><small>Spooky Secrets · October 2026 contest.</small></span></label>
   </fieldset>
   <div className="wb-form-pair"><label>Project title<input required maxLength={100} value={draft.title} onChange={e=>change({title:e.target.value})}/></label><label>Creator name<input required maxLength={80} value={draft.creator} onChange={e=>change({creator:e.target.value})} placeholder="Your name or handle"/></label></div>
   <label>About your project<textarea required minLength={20} maxLength={2000} rows={3} value={draft.summary} onChange={e=>change({summary:e.target.value})} placeholder="What did you build, and what can people try?"/></label>
   <label>Public source code<input required type="url" value={draft.repoUrl} onChange={e=>change({repoUrl:e.target.value})} placeholder="https://github.com/you/your-project"/></label>
   <label>Live project <small>(optional)</small><input type="url" value={draft.demoUrl} onChange={e=>change({demoUrl:e.target.value})} placeholder="https://your-project.example"/></label>
   {draft.destination==='october-2026'&&<div className="wb-contest-note"><p>Post your entry in the <a href="https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396" target="_blank" rel="noreferrer">official contest thread</a> first. A lobby listing does not register a contest entry.</p><label>Official entry post<input required type="url" value={draft.forumUrl} onChange={e=>change({forumUrl:e.target.value})} placeholder="https://community.tari.com/t/…/396/your-post"/></label><a href="https://community.tari.com/t/ootle-launch-date-and-launch-contest-rules/323/1" target="_blank" rel="noreferrer">Contest rules</a></div>}
   <div className="wb-publication-preview"><span className="wb-section-label">LISTING PREVIEW · NOT PUBLISHED</span><h3>{draft.title||'Your project'}</h3><p>{draft.summary||'Your description will appear here.'}</p><small>By {draft.creator||'you'} · {draft.destination==='community'?'Community Projects':'October Submissions'}</small></div>
   {!connected&&<p className="wb-service-note">Publishing isn’t connected yet. You can prepare and download your submission.</p>}
   <p className="wb-service-note">Publishing shares your project files and listing. Your browser drafts stay private until you submit.</p>
   <div className="wb-form-actions"><button className="wb-primary" type="submit" disabled={!connected||busy||published}>{busy?'Submitting…':'Publish project'}</button><button type="button" onClick={onExport}>Download submission</button></div>
   {status&&<p role="status">{status}</p>}{published&&<Link to={draft.destination==='community'?'/#community-projects':'/#october-submissions'}>View in the lobby</Link>}
  </form>
 </div>;
}
