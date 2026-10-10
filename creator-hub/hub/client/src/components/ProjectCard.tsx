import {safeHref} from '../../../shared/safeLinks.mjs';
import type {ReactNode} from 'react';
import {ResourceCardMedia,type CardMediaResource} from '../ui';
import ProjectTechnology from './ProjectTechnology';
import ContestProjectMetrics, {type ProjectMetrics} from './ContestProjectMetrics';
import './CommunityContent.css';

type Props={resource:CardMediaResource;sourceUrl:string;creator:string;summary:string;repoUrl?:string|null;metrics?:ProjectMetrics;technologies?:{label:string;sourceUrl:string}[];dates?:ReactNode;caption?:ReactNode;actions?:ReactNode};
// The title's native link stretches over the card. Other links and controls sit
// above it, preserving keyboard access, middle-click and independent actions.
export default function ProjectCard({resource,sourceUrl,creator,summary,repoUrl,metrics,technologies,dates,caption,actions}:Props){
 return <article id={`project-${resource.id.replaceAll(':','-')}`} className="card contest-project-card project-card">
  <div className="contest-project-cover"><ResourceCardMedia r={resource} metrics={<ContestProjectMetrics value={metrics} repoUrl={repoUrl}/>}/>{(!technologies||technologies.length>0)&&<ProjectTechnology resourceId={resource.id} labels={technologies}/>}</div>
  <h3 className="mt16"><a className="project-card-primary" href={safeHref(sourceUrl)} target="_blank" rel="noreferrer">{resource.title}</a></h3>
  {dates}<p>{summary}</p><p className="faint">By {creator}</p>{caption}
  <div className="contest-project-actions">{actions}</div>{safeHref(sourceUrl)&&<small className="faint">Source: {new URL(sourceUrl,'https://ootle-lobby-preview.vercel.app').hostname}</small>}
 </article>;
}
