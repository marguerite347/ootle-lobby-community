import {readCommunityProjects} from '../shared/readCommunityProjects.mjs';
import {makeResource} from './model.mjs';
const projects=readCommunityProjects(new URL('../../../',import.meta.url));
// Exact reviewed IDs prevent similarly named community apps from acquiring an
// official project's cover. Never match official records by title or URL.
export function withShowcaseProjects(records){
 const result=new Map(records.map(r=>[r.id,r]));
 for(const p of projects){
  const ids=p.resourceIds?.length?p.resourceIds:[`${p.ecosystem}:app:${p.slug}`];
  for(const id of ids){
   const existing=result.get(id);
   const resource=existing||makeResource({id,type:'app',ecosystem:p.ecosystem,title:p.title,summary:p.summary,sourceId:'reviewed-showcase',sourceName:'Reviewed Lobby project registry',sourceUrl:p.sourceUrl,sourceUpdatedAt:p.publishedAt,verification:'source-attested',readiness:'conceptual'});
   result.set(id,{...resource,summary:existing?.type==='starter'?existing.summary:p.summary,repoUrl:p.repoUrl,demoUrl:p.demoUrl||resource.demoUrl,creator:existing?.creator||{name:p.creator,url:p.sourceUrl},preview:{image:p.media?.image||null,video:p.media?.video||null,source:p.media?.label||null}});
  }
 }
 return [...result.values()];
}
