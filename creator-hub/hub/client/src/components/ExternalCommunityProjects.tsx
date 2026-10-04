import {useEffect,useState} from 'react';
import {ResourceCardMedia} from '../ui';
import ProjectTechnology from './ProjectTechnology';
import ContestProjectMetrics,{useContestMetrics} from './ContestProjectMetrics';
import {COMMUNITY_REPOSITORY} from './CommunityContent';
import './ContestProjectDates.css';
import './CommunityContent.css';
export type ExternalProject={slug:string;title:string;summary:string;creator:string;sourceUrl:string;sourceLabel:string;repoUrl:string|null;publishedAt:string;publicationBasis:string;publicationLabel:string;publicationUrl:string;ecosystem:string;forum:{url:string}|null;technologies:{label:string;sourceUrl:string}[];media:{image:string;video:string;label:string;sourceUrl:string}|null};
export function useExternalCommunityProjects(enabled:boolean){
 const [items,setItems]=useState<ExternalProject[]>([]),[failed,setFailed]=useState(false);
 useEffect(()=>{if(!enabled)return;const controller=new AbortController();fetch('/api/community-content',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Unavailable');return r.json();}).then(feed=>setItems(feed.communityProjects||[])).catch(e=>{if(e.name!=='AbortError')setFailed(true);});return()=>controller.abort();},[enabled]);
 return {items,failed};
}
const date=(value:string)=>new Date(value).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'});
export default function ExternalCommunityProjects({items}:{items:ExternalProject[]}){
 const metrics=useContestMetrics('/api/community-projects/metrics');
 return <div className="grid">{[...items].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).map(p=>{
  const value=metrics[p.slug];
  return <article className="card contest-project-card" key={p.slug}>
   <div className="contest-project-cover"><ResourceCardMedia r={{id:p.slug,title:p.title,ecosystem:p.ecosystem,native:true,preview:p.media}} metrics={<ContestProjectMetrics value={value}/>}/>{p.technologies.length>0&&<ProjectTechnology resourceId={p.slug} labels={p.technologies}/>}</div>
   <h3 className="mt16"><a href={p.sourceUrl} target="_blank" rel="noreferrer">{p.title}</a></h3>
   <div className="contest-project-dates"><a href={p.publicationUrl} title={p.publicationBasis} target="_blank" rel="noreferrer"><span>{p.publicationLabel}</span><time dateTime={p.publishedAt}>{date(p.publishedAt)}</time></a>{p.repoUrl&&<a href={value?.github?.activityUrl||`${p.repoUrl}/activity`} target="_blank" rel="noreferrer" title="Latest repository push reported by GitHub"><span>GitHub activity</span>{value?.github?.pushedAt?<time dateTime={value.github.pushedAt}>{date(value.github.pushedAt)}</time>:'Unavailable'}</a>}</div>
   <p>{p.summary}</p><p className="faint">By {p.creator}</p>
   {p.media&&<a className="community-media-caption" href={p.media.video} target="_blank" rel="noreferrer">{p.media.label}</a>}
   <div className="contest-project-actions"><a href={p.sourceUrl} target="_blank" rel="noreferrer">{p.sourceLabel}</a>{p.forum&&<a href={p.forum.url} target="_blank" rel="noreferrer">Forum discussion</a>}<a className="suggest-project-edit" href={`${COMMUNITY_REPOSITORY}/edit/main/content/community-projects/${p.slug}.json`} target="_blank" rel="noreferrer">Suggest an edit</a></div>
  </article>;
 })}</div>;
}
