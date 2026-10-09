import {safeHref} from '../../shared/safeLinks.mjs';
import RemixInvitation from './components/RemixInvitation';
import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {api,type Project,type Resource} from './api';
import {ProjectCover} from './ProjectCover';
export {ProjectCover} from './ProjectCover';
import {MediaCard} from './media';
import {playableRelease, playUrlWithProject} from './projectDiscovery';
export function ReleaseFeature({project}:{project:Project}){const release=playableRelease(project);return <article className="release-feature"><ProjectCover project={project}/><div className="release-copy"><span className="release-label">Published creation</span><h2>{project.title}</h2><p>{project.description}</p><p className="faint">By {project.author}</p><div className="release-actions">{release&&<a className="btn primary" href={safeHref(playUrlWithProject(release.playUrl, project.id))}>Play / open ↗</a>}<Link className="more" to={`/project/${project.id}`}>Explore & Riff →</Link></div>{release&&<small>{release.status}</small>}</div></article>}
export function ProjectCollectionActions({project}:{project:Project}){
  const release=playableRelease(project);
  return <div className="release-actions">
    {release&&<a className="btn primary" href={safeHref(playUrlWithProject(release.playUrl, project.id))}>Play / open ↗</a>}
    <Link className="more" to={`/project/${project.id}`}>Open project ↗</Link>
    <Link className="more" to={`/project/${project.id}#manage-project`}>Manage →</Link>
  </div>;
}
// Old games and preset Riffs were removed for a fresh start. Until new games are
// published, the home shelf shows an empty state plus external starter templates.
export function PublishedShelf(){
 const [starters,setStarters]=useState<Resource[]>([]);
 useEffect(()=>{
   Promise.allSettled([
     api.resource('gdevelop:starter:360-platformer'),
     api.resource('tari-ootle:starter:examples-guessing-game-template'),
   ]).then(results=>setStarters(results.flatMap(r=>r.status==='fulfilled'?[r.value]:[])));
 },[]);
 return <section className="section publication-shelf">
   <div className="project-empty"><h3>New games are on the way.</h3><p>The lobby is getting a fresh start. <Link to="/create">Start creating →</Link></p></div>
   {starters.length>0&&<><div className="section-head"><div><span className="release-label">A different starting point</span><h3>Start from a template.</h3><p className="sub">A gravity-bending platformer or a native guessing-game template.</p></div><Link className="more" to="/create">All game starters →</Link></div><div className="project-starter-grid">{starters.map(r=><MediaCard key={r.id} r={r}/>)}</div></>}
 </section>;
}

export function CommunitySpotlight() {
 return (
   <div className="community-invitation-heading"><div><span className="release-label">Made by the community</span><h2>In the spotlight</h2><p className="sub">Play a creation. Explore how it works. Make it your own.</p><Link className="more" to="/projects?view=published">All releases & Riffs →</Link></div><RemixInvitation/></div>
 );
}
