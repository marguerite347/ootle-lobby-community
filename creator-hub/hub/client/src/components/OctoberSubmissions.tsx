import {safeHref} from '../../../shared/safeLinks.mjs';
// INTEGRATION_GAP[WB-FEED] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-feed.
import PublicationGallery from '../workbench/PublicationGallery';
import {useEffect,useState} from 'react';
import CollapsibleProjects from './CollapsibleProjects';
import './CommunityContent.css';

export type {ReviewedContest as OctoberContest} from './ContestGallery';
import {ContestGallery, type ReviewedContest as OctoberContest} from './ContestGallery';
export function OctoberGallery(props:{contest:OctoberContest;hasWorkbenchEntries?:boolean}) {
  return <ContestGallery {...props} emptyMessage="October entries are closed. No archived projects are listed here yet."/>;
}
const THREAD='https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396';
export default function OctoberSubmissions(){
  const [workbenchCount,setWorkbenchCount]=useState(0);
  const [contest,setContest]=useState<OctoberContest|null>(null),[failed,setFailed]=useState(false);
  useEffect(()=>{const controller=new AbortController();fetch('/api/community-content',{signal:controller.signal}).then(response=>{if(!response.ok)throw new Error('Unavailable');return response.json();}).then(feed=>{const result=feed.contests?.find((item:OctoberContest)=>item.id==='october-2026');if(!result)throw new Error('Missing registry');setContest(result);}).catch(error=>{if(error.name!=='AbortError')setFailed(true);});return()=>controller.abort();},[]);
  return <section className="section october-submissions" id="october-submissions" aria-labelledby="october-submissions-title">
    <div className="section-head project-section-heading"><div><h2 id="october-submissions-title">October <em>Submissions</em></h2><p>Spooky Secrets · Entries closed. Explore the October builds.</p></div><div className="contest-community-links"><a href={safeHref(THREAD)} target="_blank" rel="noreferrer">Official contest thread</a></div></div>
    <p className="submission-check">Nov 2 testnet reset: the contest organizer asked builders to republish templates and update their submitted versions. <a href={`${THREAD}/44`} target="_blank" rel="noreferrer">Read the organizer’s update</a></p>
    <CollapsibleProjects label="October Submissions"><PublicationGallery destination="october-2026" excludeRepoUrls={contest?.entries.map(entry=>entry.repoUrl)} onCount={setWorkbenchCount}/>
    {contest?<OctoberGallery contest={contest} hasWorkbenchEntries={workbenchCount>0}/>:failed?<p role="status">The submission list could not load. <a href={safeHref(THREAD)} target="_blank" rel="noreferrer">View entries on the forum.</a></p>:<p role="status">Loading October submissions…</p>}
    </CollapsibleProjects>
  </section>;
}
