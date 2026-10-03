import {useEffect,useState} from 'react';
import {COMMUNITY_REPOSITORY} from './CommunityContent';
import ProjectTechnology from './ProjectTechnology';
import './CommunityContent.css';

type Entry={slug:string;title:string;summary:string;creator:string;sourceUrl:string;repoUrl:string;demoUrl?:string;publishedAt:string;updatedAt:string;technologies:{label:string;sourceUrl:string}[];recording?:{url:string;posterUrl?:string;capturedAt:string;sourceRevision:string;kind:string;credit:string}};
export type OctoberContest={id:string;title:string;threadUrl:string;checkedAt:string;observedSubmissionPosts:number;entries:Entry[]};
const THREAD='https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396';
const date=(value:string)=>new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
const mysteries=[
  {title:'Something is brewing.',art:'ritual-cauldron-v2.png'},
  {title:'A secret worth keeping.',art:'ritual-spellbook-v3.png'},
  {title:'Unknown. For now.',art:'creator-ghost.png'},
];
function OctoberMysteries(){
  return <div className="october-mysteries">
    <div className="mystery-grid" aria-label="Teasers for future October submissions">
      {mysteries.map((mystery,index)=><article className={`mystery-card mystery-card-${index+1}`} key={mystery.art}>
        <div className="mystery-card-top"><span>SECRET {String(index+1).padStart(2,'0')}</span><span className="mystery-seal">Unrevealed</span></div>
        <div className="mystery-art" aria-hidden="true"><img src={`/seasonal/october-2026/${mystery.art}`} alt="" width="1254" height="1254" loading="lazy"/><span className="mystery-question">?</span></div>
        <h3>{mystery.title}</h3><p>Your build could be here.</p>
      </article>)}
    </div>
    <p className="mystery-invitation">The first reveals are still to come. <a href={THREAD} target="_blank" rel="noreferrer">Bring your secret to life <span aria-hidden="true">↗</span></a></p>
  </div>;
}
export function OctoberGallery({contest}:{contest:OctoberContest}){
  const entries=[...contest.entries].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||a.slug.localeCompare(b.slug));
  return <>
    {!entries.length ? <OctoberMysteries/> : <div className="grid">{entries.map(entry=><article className="card contest-project-card" key={entry.slug}>
      {entry.recording && <figure className="submission-recording"><video controls playsInline preload="none" poster={entry.recording.posterUrl} aria-label={`${entry.title} ${entry.recording.kind} recording`} src={entry.recording.url}/><figcaption>{entry.recording.kind.replaceAll('-',' ')} · Recorded {date(entry.recording.capturedAt)} · {entry.recording.credit}</figcaption></figure>}
      <h3><a href={entry.sourceUrl} target="_blank" rel="noreferrer">{entry.title}</a></h3>
      <div className="contest-project-dates"><a href={entry.sourceUrl} target="_blank" rel="noreferrer">Submitted <time dateTime={entry.publishedAt}>{date(entry.publishedAt)}</time></a></div>
      <p>{entry.summary}</p><p className="faint">By {entry.creator}</p>
      <ProjectTechnology resourceId={`october:${entry.slug}`} labels={entry.technologies}/>
      <div className="contest-project-actions"><a href={entry.repoUrl} target="_blank" rel="noreferrer">Source code</a>{entry.demoUrl&&<a href={entry.demoUrl} target="_blank" rel="noreferrer">Open project</a>}<a href={`${COMMUNITY_REPOSITORY}/edit/main/content/submissions/october-2026/${entry.slug}.json`} target="_blank" rel="noreferrer">Suggest an edit</a></div>
    </article>)}</div>}
    <p className="submission-check">Forum checked <time dateTime={contest.checkedAt}>{date(contest.checkedAt)} at {new Date(contest.checkedAt).toISOString().slice(11,16)} UTC</time>{contest.observedSubmissionPosts===0?' · No submission posts at that check.':` · ${contest.observedSubmissionPosts} submission posts at that check.`} <a href={THREAD} target="_blank" rel="noreferrer">Check the latest</a></p>
  </>;
}
export default function OctoberSubmissions(){
  const [contest,setContest]=useState<OctoberContest|null>(null),[failed,setFailed]=useState(false);
  useEffect(()=>{const controller=new AbortController();fetch('/api/community-content',{signal:controller.signal}).then(response=>{if(!response.ok)throw new Error('Unavailable');return response.json();}).then(feed=>{const result=feed.contests?.find((item:OctoberContest)=>item.id==='october-2026');if(!result)throw new Error('Missing registry');setContest(result);}).catch(error=>{if(error.name!=='AbortError')setFailed(true);});return()=>controller.abort();},[]);
  return <section className="section october-submissions" id="october-submissions" aria-labelledby="october-submissions-title">
    <div className="section-head"><div><h2 id="october-submissions-title">October submissions</h2><p>Spooky Secrets · New builds from the community.</p></div><div className="contest-community-links"><a className="more" href={THREAD} target="_blank" rel="noreferrer">Submit your build</a><a href={`${COMMUNITY_REPOSITORY}/issues/new?template=correction.yml&title=October%20project`} target="_blank" rel="noreferrer">Suggest a listing</a></div></div>
    {contest?<OctoberGallery contest={contest}/>:failed?<p role="status">The submission list could not load. <a href={THREAD} target="_blank" rel="noreferrer">View entries on the forum.</a></p>:<p role="status">Loading October submissions…</p>}
  </section>;
}
