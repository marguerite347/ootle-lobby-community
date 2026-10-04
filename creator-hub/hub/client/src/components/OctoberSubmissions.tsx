// INTEGRATION_GAP[WB-FEED] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-feed.
import PublicationGallery from '../workbench/PublicationGallery';
import {useEffect,useState} from 'react';
import {COMMUNITY_REPOSITORY} from './CommunityContent';
import ProjectCard from './ProjectCard';
import {useContestMetrics} from './ContestProjectMetrics';
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
export function OctoberGallery({contest,hasWorkbenchEntries=false}:{contest:OctoberContest;hasWorkbenchEntries?:boolean}){
  const metrics=useContestMetrics('/api/community-projects/metrics');
  const entries=[...contest.entries].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||a.slug.localeCompare(b.slug));
  return <>
    {!entries.length ? (hasWorkbenchEntries?null:<OctoberMysteries/>) : <div className="grid">{entries.map(entry=><ProjectCard key={entry.slug} resource={{id:`october:${entry.slug}`,title:entry.title,ecosystem:'tari-ootle',native:true,preview:entry.recording?{image:entry.recording.posterUrl||null,video:entry.recording.url}:null}} sourceUrl={entry.sourceUrl} creator={entry.creator} summary={entry.summary} repoUrl={entry.repoUrl} metrics={metrics[`october:${entry.slug}`]} technologies={entry.technologies}
      dates={<div className="contest-project-dates"><a href={entry.sourceUrl} target="_blank" rel="noreferrer">Submitted <time dateTime={entry.publishedAt}>{date(entry.publishedAt)}</time></a>{/^https:\/\/github\.com\//.test(entry.repoUrl)&&<a href={`${entry.repoUrl.split('/').slice(0,5).join('/')}/activity`} target="_blank" rel="noreferrer">GitHub activity {metrics[`october:${entry.slug}`]?.github?.pushedAt?date(metrics[`october:${entry.slug}`].github!.pushedAt!):'Unavailable'}</a>}</div>}
      caption={entry.recording&&<a className="community-media-caption" href={entry.recording.url} target="_blank" rel="noreferrer">{entry.recording.kind.replaceAll('-',' ')} · Recorded {date(entry.recording.capturedAt)} · {entry.recording.credit}</a>}
      actions={<><a href={entry.sourceUrl} target="_blank" rel="noreferrer">See the creator’s post</a><a href={entry.repoUrl} target="_blank" rel="noreferrer">Source code</a>{entry.demoUrl&&<a href={entry.demoUrl} target="_blank" rel="noreferrer">Open project</a>}<a href={`${COMMUNITY_REPOSITORY}/edit/main/content/submissions/october-2026/${entry.slug}.json`} target="_blank" rel="noreferrer">Suggest an edit</a></>}/>
    )}</div>}
    <p className="submission-check">Forum checked <time dateTime={contest.checkedAt}>{date(contest.checkedAt)} at {new Date(contest.checkedAt).toISOString().slice(11,16)} UTC</time>{contest.observedSubmissionPosts===0?' · No submission posts at that check.':` · ${contest.observedSubmissionPosts} submission posts at that check.`} <a href={THREAD} target="_blank" rel="noreferrer">Check the latest</a></p>
  </>;
}
export default function OctoberSubmissions(){
  const [workbenchCount,setWorkbenchCount]=useState(0);
  const [contest,setContest]=useState<OctoberContest|null>(null),[failed,setFailed]=useState(false);
  useEffect(()=>{const controller=new AbortController();fetch('/api/community-content',{signal:controller.signal}).then(response=>{if(!response.ok)throw new Error('Unavailable');return response.json();}).then(feed=>{const result=feed.contests?.find((item:OctoberContest)=>item.id==='october-2026');if(!result)throw new Error('Missing registry');setContest(result);}).catch(error=>{if(error.name!=='AbortError')setFailed(true);});return()=>controller.abort();},[]);
  return <section className="section october-submissions" id="october-submissions" aria-labelledby="october-submissions-title">
    <div className="section-head project-section-heading"><div><h2 id="october-submissions-title">October Submissions</h2><p>Spooky Secrets · New builds from the community.</p></div><div className="contest-community-links"><a className="more" href={THREAD} target="_blank" rel="noreferrer">Submit your build</a><a href={`${COMMUNITY_REPOSITORY}/issues/new?template=correction.yml&title=October%20project`} target="_blank" rel="noreferrer">Suggest a listing</a></div></div>
    <PublicationGallery destination="october-2026" excludeRepoUrls={contest?.entries.map(entry=>entry.repoUrl)} onCount={setWorkbenchCount}/>
    {contest?<OctoberGallery contest={contest} hasWorkbenchEntries={workbenchCount>0}/>:failed?<p role="status">The submission list could not load. <a href={THREAD} target="_blank" rel="noreferrer">View entries on the forum.</a></p>:<p role="status">Loading October submissions…</p>}
  </section>;
}
