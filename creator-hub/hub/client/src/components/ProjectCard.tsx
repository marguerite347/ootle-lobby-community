import {safeHref} from '../../../shared/safeLinks.mjs';
import {useId,useState,type ReactNode} from 'react';
import {ResourceCardMedia,type CardMediaResource} from '../ui';
import ProjectTechnology from './ProjectTechnology';
import ContestProjectMetrics, {type ProjectMetrics} from './ContestProjectMetrics';
import './CommunityContent.css';

type Props={resource:CardMediaResource;sourceUrl:string;creator:string;summary:string;cardSummary?:string;cardStatus?:string;repoUrl?:string|null;metrics?:ProjectMetrics;technologies?:{label:string;sourceUrl:string}[];dates?:ReactNode;caption?:ReactNode;actions?:ReactNode;frontActions?:ReactNode};
export function recordingLabel(source?:string|null){
 if(!source)return null;
 if(/concept overview/i.test(source))return 'Concept overview';
 if(/\bannouncement\b/i.test(source))return 'Announcement';
 if(/^app demo\b/i.test(source))return 'App demo';
 if(/docs|source|repository|guide/i.test(source))return 'Docs walkthrough';
 return 'Page walkthrough';
}
// Keep technology links outside the toggle so they remain visible and independent.
export default function ProjectCard({resource,sourceUrl,creator,summary,cardSummary,cardStatus,repoUrl,metrics,technologies,dates,caption,actions,frontActions}:Props){
 const [detailsOpen,setDetailsOpen]=useState(false);
 const detailsId=useId();
 return <article id={`project-${resource.id.replaceAll(':','-')}`} className="card contest-project-card project-card">
  <div className="contest-project-cover"><ResourceCardMedia r={resource} metrics={<ContestProjectMetrics value={metrics} repoUrl={repoUrl}/>}/></div>
  <h3><a className="project-card-primary" href={safeHref(sourceUrl)} target="_blank" rel="noreferrer">{resource.title}</a></h3>
  <p className="card-front-summary">{cardSummary || summary}</p>
  <div className="card-front-status">{cardStatus&&<strong>{cardStatus}</strong>}{resource.preview?.video&&<span>{recordingLabel(resource.preview.source)}</span>}</div>
  <p className="card-byline">By {creator}</p>
  <div className="card-front-links">{frontActions || <a href={safeHref(sourceUrl)} target="_blank" rel="noreferrer">Creator’s post</a>}</div>
  <div className="project-card-detail-controls">
   <button type="button" className="project-card-detail-toggle" aria-expanded={detailsOpen} aria-controls={detailsId} aria-label={detailsOpen?`Close details for ${resource.title}`:`Explore project: ${resource.title}`} onClick={()=>setDetailsOpen(open=>!open)}>
    <span>{detailsOpen?'Close':'Explore'}</span><span className="project-card-detail-symbol" aria-hidden="true">{detailsOpen?'−':'+'}</span>
   </button>
   {(!technologies||technologies.length>0)&&<ProjectTechnology resourceId={resource.id} labels={technologies}/>}
  </div>
  <div id={detailsId} className="card-details project-card-details-content" hidden={!detailsOpen}>
   {cardSummary&&<p>{summary}</p>}{dates}{caption}
   <div className="contest-project-actions">{actions}</div>
   {repoUrl&&<a href={safeHref(repoUrl)} target="_blank" rel="noreferrer">Repository</a>}
  </div>
 </article>;
}
