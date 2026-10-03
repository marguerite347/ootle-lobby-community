import {useEffect,useRef,useState} from 'react';
import {api, type Project} from './api';
import {ProjectArtwork} from './ProjectArtwork';
export function ProjectCover({project}:{project:Project}){
 const [parent,setParent]=useState<Project|null>(null);
 useEffect(()=>{
  let active=true;setParent(null);
  if(project.forkedFrom&&!project.release?.videoUrl) {
   api.project(project.forkedFrom).then(({project:original})=>{if(active)setParent(original);}).catch(()=>{});
  }
  return()=>{active=false;};
 },[project.id,project.forkedFrom,project.release?.videoUrl]);
 const videoUrl=project.release?.videoUrl||parent?.release?.videoUrl;
 const posterUrl=project.release?.videoUrl?project.release.posterUrl:parent?.release?.posterUrl||project.release?.posterUrl;
 const coverLabel=parent?.release?.videoUrl&&!project.release?.videoUrl?`${project.title} · original ${parent.title} gameplay`:`${project.title} preview`;
 const [failed,setFailed]=useState(false);
 const [posterFailed,setPosterFailed]=useState(false);
 useEffect(()=>{setFailed(false);setPosterFailed(false);},[project.id,videoUrl,posterUrl]);
 const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{const video=ref.current;if(!video)return;const media=matchMedia('(prefers-reduced-motion: reduce)');let visible=false;
 const update=()=>{if(visible&&!media.matches)void video.play().catch(()=>{});else video.pause();};
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()});observer.observe(video);media.addEventListener('change',update);
 return()=>{observer.disconnect();media.removeEventListener('change',update)};},[project.id,videoUrl,failed]);
 return videoUrl&&!failed?<video onError={()=>setFailed(true)} ref={ref} className="project-cover" src={videoUrl} poster={posterUrl||undefined} muted loop playsInline controls preload="metadata" aria-label={coverLabel} title={coverLabel}/>:posterUrl&&!posterFailed?<img className="project-cover" src={posterUrl} alt={`${project.title} cover`} onError={()=>setPosterFailed(true)}/>:<ProjectArtwork project={project}/>;
}
