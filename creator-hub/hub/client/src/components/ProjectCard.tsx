import {safeHref} from '../../../shared/safeLinks.mjs';
import type {ReactNode} from 'react';
import {ResourceCardMedia,type CardMediaResource} from '../ui';
import ProjectTechnology from './ProjectTechnology';
import ContestProjectMetrics, {type ProjectMetrics} from './ContestProjectMetrics';
import './CommunityContent.css';

type Props={resource:CardMediaResource;sourceUrl:string;creator:string;summary:string;cardSummary?:string;cardStatus?:string;repoUrl?:string|null;metrics?:ProjectMetrics;technologies?:{label:string;sourceUrl:string}[];dates?:ReactNode;caption?:ReactNode;actions?:ReactNode;frontActions?:ReactNode};
export function recordingLabel(source?:string|null){
 if(!source)return null;
 if(/concept overview/i.test(source))return 'Concept overview';
 if(/announcement walkthrough/i.test(source))return 'Announcement';
 if(/docs|source|repository|guide/i.test(source))return 'Docs walkthrough';
 return 'Page walkthrough';
}
// Separate authored front copy from complete source qualifications. Native
// details keeps metadata and secondary links reachable with mouse and keyboard.
export default function ProjectCard({resource,sourceUrl,creator,summary,cardSummary,cardStatus,repoUrl,metrics,technologies,dates,caption,actions,frontActions}:Props){
 return <article id={`project-${resource.id.replaceAll(':','-')}`} className="card contest-project-card project-card">
  <div className="contest-project-cover"><ResourceCardMedia r={resource} metrics={<ContestProjectMetrics value={metrics} repoUrl={repoUrl}/>}/></div>
  <h3><a className="project-card-primary" href={safeHref(sourceUrl)} target="_blank" rel="noreferrer">{resource.title}</a></h3>
  <p className="card-front-summary">{cardSummary || summary}</p>
  <div className="card-front-status">{cardStatus&&<strong>{cardStatus}</strong>}{resource.preview?.video&&<span>{recordingLabel(resource.preview.source)}</span>}</div>
  <p className="card-byline">By {creator}{technologies?.[0]&&<> · {technologies[0].label}</>}</p>
  <div className="card-front-links">{frontActions || <a href={safeHref(sourceUrl)} target="_blank" rel="noreferrer">Creator’s post ↗</a>}</div>
  <details className="card-details"><summary aria-label={`Details about ${resource.title}`}>Details</summary>
   {cardSummary&&<p>{summary}</p>}{dates}{caption}
   {(!technologies||technologies.length>0)&&<ProjectTechnology resourceId={resource.id} labels={technologies}/>}
   <div className="contest-project-actions">{actions}</div>
   {repoUrl&&<a href={safeHref(repoUrl)} target="_blank" rel="noreferrer">Repository ↗</a>}
  </details>
 </article>;
}
