import {getJson} from './http.mjs';
import {makeResource} from '../model.mjs';
export const source={id:'ambientcg',name:'ambientCG',kind:'rest',canonicalUrl:'https://ambientcg.com/',ingestion:'Complete public v3 asset metadata with pagination; source-hosted thumbnails and downloads',native:false};
export async function fetchLive({read=getJson}={}){
 const records=[],seen=new Set();let total;
 for(let offset=0;offset<50000;offset+=500){
  const d=await read(`https://ambientcg.com/api/v3/assets?limit=500&offset=${offset}&sort=alphabet&include=type,title,url,tags,thumbnails,releaseDate,shortDescription`,{timeoutMs:30000});
  if(!Array.isArray(d.assets)||!Number.isInteger(d.totalResults)||d.totalResults<1)throw Error('Invalid ambientCG catalog');
  if(total!==undefined&&total!==d.totalResults)throw Error('ambientCG changed during pagination; retry next pass');total=d.totalResults;
  if(!d.assets.length)throw Error('Incomplete ambientCG pagination');
  for(const a of d.assets){
   if(typeof a.id!=='string'||!a.id||typeof a.title!=='string'||seen.has(a.id)||!/^https:\/\/ambientcg.com\/a\//.test(a.url||''))throw Error('Invalid or duplicate ambientCG asset');seen.add(a.id);
   records.push(makeResource({id:`ambientcg:asset:${a.id}`,title:a.title,type:'asset',assetKind:'asset',access:'free',ecosystem:'creative',summary:a.shortDescription||`${a.type} for environments and game scenes. Download from ambientCG.`,category:a.type,sourceUrl:a.url,demoUrl:a.url,tags:['asset',a.type,...(a.tags||[])],license:'CC0',creator:{name:'ambientCG',url:source.canonicalUrl},attribution:'ambientCG',sourceId:source.id,sourceName:source.name,upstreamId:a.id,sourceUpdatedAt:a.releaseDate||null,verification:'source-attested',readiness:'runnable-example',preview:{image:a.thumbnails?.['512-WEBP']||a.thumbnails?.['512-PNG']||null,video:null,source:'ambientCG asset thumbnail'}}));
  }
  if(records.length===total)return {records};
  if(records.length>total)throw Error('ambientCG count mismatch');
 }
 throw Error('ambientCG pagination exceeded bound');
}
