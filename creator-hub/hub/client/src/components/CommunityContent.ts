import {useEffect,useState} from 'react';
export const COMMUNITY_REPOSITORY = 'https://github.com/marguerite347/ootle-lobby-community';
export type CommunityProject = {id:string;title:string;summary:string;technologies:{label:string;sourceUrl:string}[]};
export function projectEditUrl(id:string) {
  return `${COMMUNITY_REPOSITORY}/edit/main/content/projects/${encodeURIComponent(id.replace('tari-ootle:app:',''))}.json`;
}
export function useCommunityContent() {
  const [projects,setProjects]=useState<Record<string,CommunityProject>>({});
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/community-content',{signal:controller.signal})
      .then(response=>{if(!response.ok)throw new Error('Content unavailable');return response.json();})
      .then(result=>setProjects(Object.fromEntries(result.projects.map((project:CommunityProject)=>[project.id,project]))))
      .catch(()=>{/* Keep the bundled content when the accepted feed is unavailable. */});
    return ()=>controller.abort();
  },[]);
  return projects;
}
