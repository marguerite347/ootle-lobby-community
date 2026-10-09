import {safeHref} from '../../../shared/safeLinks.mjs';
import {useEffect,useState} from 'react';
import ProjectCard from './ProjectCard';
import {useContestMetrics} from './ContestProjectMetrics';
import {COMMUNITY_REPOSITORY} from './CommunityContent';
import CollapsibleProjects from './CollapsibleProjects';
import './ContestProjectDates.css';
import './CommunityContent.css';
export type ExternalProject={slug:string;section?:'community'|'official';resourceIds?:string[];demoUrl?:string;title:string;summary:string;creator:string;sourceUrl:string;sourceLabel:string;repoUrl:string|null;publishedAt:string;publicationBasis:string;publicationLabel:string;publicationUrl:string;ecosystem:string;forum:{url:string}|null;technologies:{label:string;sourceUrl:string}[];media:{image:string;video:string;label:string;sourceUrl:string}|null};
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
  return <ProjectCard key={p.slug} resource={{id:p.slug,title:p.title,ecosystem:p.ecosystem,native:true,preview:p.media}} sourceUrl={p.sourceUrl} creator={p.creator} summary={p.summary} repoUrl={p.repoUrl} metrics={value} technologies={p.technologies}
   dates={
   <div className="contest-project-dates"><a href={safeHref(p.publicationUrl)} title={p.publicationBasis} target="_blank" rel="noreferrer"><span>{p.publicationLabel}</span><time dateTime={p.publishedAt}>{date(p.publishedAt)}</time></a>{p.repoUrl&&<a href={safeHref(value?.github?.activityUrl||`${p.repoUrl}/activity`)} target="_blank" rel="noreferrer" title="Latest repository push reported by GitHub"><span>GitHub activity</span>{value?.github?.pushedAt?<time dateTime={value.github.pushedAt}>{date(value.github.pushedAt)}</time>:'Unavailable'}</a>}</div>}
   caption={p.media&&<a className="community-media-caption" href={safeHref(p.media.video)} target="_blank" rel="noreferrer">{p.media.label}</a>}
   actions={<><a href={safeHref(p.sourceUrl)} target="_blank" rel="noreferrer">{p.sourceLabel}</a>{p.forum&&<a href={safeHref(p.forum.url)} target="_blank" rel="noreferrer">Forum discussion</a>}{p.demoUrl&&<a href={safeHref(p.demoUrl)} target="_blank" rel="noreferrer">Open project</a>}<a className="suggest-project-edit" href={safeHref(`${COMMUNITY_REPOSITORY}/edit/main/content/community-projects/${p.slug}.json`)} target="_blank" rel="noreferrer">Suggest an edit</a></>}/>;
 })}</div>;
}

export function OfficialProjects(){
 const {items,failed}=useExternalCommunityProjects(true);
 const official=items.filter(p=>p.section==='official');
 return <section className="section" id="official-projects" aria-labelledby="official-projects-title"><div className="section-head project-section-heading"><div><h2 id="official-projects-title">Official Tari <em>Projects</em></h2><p>Apps and developer tools published by official Tari accounts.</p></div></div>{official.length>0?<CollapsibleProjects label="Official Tari Projects"><ExternalCommunityProjects items={official}/></CollapsibleProjects>:failed?<p role="status">Official projects couldn’t load. Refresh to retry.</p>:null}</section>;
}
