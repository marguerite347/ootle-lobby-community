import {safeHref} from '../../../shared/safeLinks.mjs';
import ChallengeInvitation from './ChallengeInvitation';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {api, type Project, type Resource} from '../api';
import {ProjectCover} from '../ProjectCover';
import {MediaCard} from '../media';
import {MONTHLY_CONTEST} from '../monthlyContest';
type Entry = {editionId:string;projectId:string;projectRef:string;summary:string;evidenceUrl:string;submittedAt:string;review:string};
export default function ChallengeEntries({refresh}:{refresh:boolean}) {
 const [entries,setEntries]=useState<Entry[]|null>(null),[projects,setProjects]=useState<Project[]>([]);
 const [contest,setContest]=useState<Resource[]|null>(null),[error,setError]=useState(''),[contestError,setContestError]=useState('');
 const [edition,setEdition]=useState('all');
 useEffect(()=>{
  let live=true;
  Promise.all([fetch('/api/challenges/submissions').then(async response=>{if(!response.ok)throw Error('Could not load weekly entries. Refresh to retry.');return response.json();}),api.projects()])
   .then(([data,result])=>{if(live){setEntries(data.submissions);setProjects(result.projects);setError('');}})
   .catch(reason=>{if(live)setError(reason.message);});
  api.resources({q:'september-contest-2026'}).then(result=>{if(live)setContest(result.items.filter(item=>item.tags?.includes('september-contest-2026')));})
   .catch(()=>{if(live)setContestError('Indexed contest projects could not load. You can still view entries on the official forum.');});
  return()=>{live=false;};
 },[refresh]);
 const editions=[...new Set((entries||[]).map(entry=>entry.editionId))];
 return <section id="entries" className="section"><span className="release-label">MADE FOR THE CHALLENGE</span><h2>See what the lobby cooked.</h2><p className="sub">Entries stay connected to their challenge and submitted version. A submission is not an approval or a prize claim.</p>
  <div className="section-head"><h3>Weekly submissions</h3><label>Edition <select value={edition} onChange={event=>setEdition(event.target.value)}><option value="all">All editions</option>{editions.map(id=><option key={id} value={id}>Week {id.replace('creator-week-','')}</option>)}</select></label></div>
  {error?<p role="alert">{error}</p>:entries===null?<p role="status">Loading entries…</p>:entries.length===0?<ChallengeInvitation/>:<div className="challenge-entry-grid">{entries.filter(entry=>edition==='all'||entry.editionId===edition).map(entry=>{
   const project=projects.find(item=>item.id===entry.projectId);
   return <article className="challenge-entry" key={`${entry.editionId}:${entry.projectId}`}>
    {project&&<ProjectCover project={project}/>}<div className="challenge-entry-copy"><span className="release-label">Week {entry.editionId.replace('creator-week-','')} · {entry.review==='pending'?'Awaiting review':entry.review}</span><h3>{project?.title||'Project no longer available'}</h3><p>{entry.summary}</p><small>Submitted {new Date(entry.submittedAt).toLocaleDateString()} · Version {entry.projectRef.slice(0,8)}</small><div className="row">{project&&<Link to={`/project/${encodeURIComponent(entry.projectId)}`}>Open project →</Link>}<a href={safeHref(entry.evidenceUrl)} target="_blank" rel="noreferrer">Submission evidence ↗</a></div><small>Project preview reflects the current project; evidence and version above identify this entry.</small></div>
   </article>;
  })}</div>}
  <section id="contest-entries" className="section"><h3>Monthly contest projects</h3><p>{MONTHLY_CONTEST.title}. Projects indexed by the Hub appear here. The official thread contains the submitted entries and their status.</p><a className="btn" href={safeHref(MONTHLY_CONTEST.entryUrl)} target="_blank" rel="noreferrer">View official contest entries ↗</a>{contestError?<p role="alert">{contestError}</p>:contest===null?<p role="status">Loading contest projects…</p>:contest.length?<div className="challenge-entry-grid">{contest.map(resource=><MediaCard key={resource.id} r={resource}/>)}</div>:<p className="faint">No contest projects are indexed in the Hub yet. Check the official thread above.</p>}</section>
 </section>;
}
