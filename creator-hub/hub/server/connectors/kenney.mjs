import {makeResource} from '../model.mjs';
import {htmlToText} from './http.mjs';
export const source={id:'kenney-packs',name:'Kenney asset packs',kind:'html',canonicalUrl:'https://kenney.nl/assets',ingestion:'Public paginated pack directory; individual source links and thumbnails, no binary mirroring',native:false};
async function readPage(url){const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(`Kenney HTTP ${r.status}`);return r.text();}
export function parsePacks(html){
 const packs=[];
 for(const part of html.split(/<div class=['"]asset['"]>/).slice(1)){
  const url=part.match(/href=['"](https:\/\/kenney.nl\/assets\/[a-z0-9-]+)['"]/)?.[1];
  const title=htmlToText(part.match(/<h2>([\s\S]*?)<\/h2>/)?.[1]||'');
  const image=part.match(/background-image:url\(["'](https:\/\/kenney.nl\/media\/[^"']+)["']\)/)?.[1];
  const category=part.match(/assets\/category:([^'"]+)/)?.[1]?.toLowerCase();
  if(!url||!title)throw Error('Unrecognized Kenney pack');
  packs.push({url,title,image,category});
 }
 if(!packs.length)throw Error('Kenney directory returned no packs');return packs;
}
export async function fetchLive({read=readPage}={}){
 const first=await read(source.canonicalUrl);
 const pages=Math.max(1,...[...first.matchAll(/assets\/page:(\d+)/g)].map(m=>Number(m[1])));
 if(pages>100)throw Error('Kenney page count exceeds bound');
 const packs=parsePacks(first);
 for(let page=2;page<=pages;page++)packs.push(...parsePacks(await read(`${source.canonicalUrl}/page:${page}`)));
 const unique=new Map(packs.map(p=>[p.url,p]));
 return {records:[...unique.values()].map(p=>makeResource({id:`kenney:asset:${p.url.split('/').pop()}`,type:'asset',assetKind:'pack',access:'free',ecosystem:'creative',title:p.title,summary:`${p.category||'Game'} asset pack by Kenney. Browse the included files and download from the original pack page.`,category:p.category||'pack',sourceUrl:p.url,demoUrl:p.url,tags:['asset','pack','kenney',p.category].filter(Boolean),creator:{name:'Kenney',url:'https://kenney.nl'},license:'CC0',attribution:'Kenney',sourceId:source.id,sourceName:source.name,upstreamId:p.url,verification:'source-attested',readiness:'runnable-example',preview:{image:p.image||null,video:null,source:'Kenney pack preview'}}))};
}
