import ExternalCommunityProjects,{useExternalCommunityProjects} from '../components/ExternalCommunityProjects';
// INTEGRATION_GAP[WB-FEED] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-feed.
import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {getPublications} from './api';
import {publishedEntries,type Destination,type Publication} from './model';
import './PublicationGallery.css';
export default function PublicationGallery({destination,section=false,excludeRepoUrls=[],onCount}:{destination:Destination;section?:boolean;excludeRepoUrls?:string[];onCount?:(count:number)=>void}) {
 const [items,setItems]=useState<Publication[]>([]),[failed,setFailed]=useState(false);
 useEffect(()=>{let live=true;getPublications().then(data=>{if(live)setItems(publishedEntries(data.items,destination));}).catch(()=>{if(live)setFailed(true);});return()=>{live=false;};},[destination]);
 const curated=useExternalCommunityProjects(destination==='community');
 const curatedRepos=new Set(curated.items.map(p=>p.repoUrl?.toLowerCase()));
 const external=curated.items.filter(p=>!excludeRepoUrls.includes(p.repoUrl||''));
 const visible=items.filter(item=>!curatedRepos.has(item.repoUrl.toLowerCase())).filter(item=>!excludeRepoUrls.includes(item.repoUrl));
 useEffect(()=>{onCount?.(visible.length+external.length);},[visible.length,external.length,onCount]);
 const content=<>{external.length>0&&<ExternalCommunityProjects items={external}/>} {visible.length>0?<div className="published-project-grid">{visible.map(item=><article key={item.id} className="published-project-card"><span>BUILT ON TARI</span><h3>{item.title}</h3><p>{item.summary}</p><small>By {item.creator}</small><div><a href={item.repoUrl} target="_blank" rel="noreferrer">Source code</a>{item.demoUrl&&<a href={item.demoUrl} target="_blank" rel="noreferrer">Open project</a>}</div></article>)}</div>:section&&external.length===0&&!curated.failed?<div className="community-project-empty"><div><strong>Your next idea belongs here.</strong><p>Apps, games and experiments shared outside the contests.</p></div><Link className="season-button" to="/workbench">Open Workbench</Link></div>:null}{(failed||curated.failed)&&<p role="status">Published projects couldn’t load. Refresh to try again.</p>}</>;
 return section?<section className="section community-projects" id="community-projects" aria-labelledby="community-projects-title"><div className="section-head"><div><h2 id="community-projects-title">Community Projects</h2><p>Apps, tools and experiments shared beyond the contests.</p></div></div>{content}</section>:content;
}
