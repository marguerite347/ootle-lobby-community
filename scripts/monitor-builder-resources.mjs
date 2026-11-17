#!/usr/bin/env node
// Read-only discovery; reviewed changes still use the normal owner PR/deploy workflow.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

export const BUILDER_SOURCES = {
  indexerA:'https://indexer-a.ootle.tari.com/templates/catalogue?limit=100',
  indexerB:'https://indexer-b.ootle.tari.com/templates/catalogue?limit=100',
  release:'https://api.github.com/repos/tari-project/tari-ootle/releases/latest',
  guides:'https://api.github.com/repos/tari-project/tari-ootle/git/trees/development?recursive=1',
};
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const hex=/^[a-f0-9]{64}$/;
export function normalizeTemplates(data){
  if(!Array.isArray(data?.entries)||!data.entries.length||(data.entries.length>=100&&!data.complete))throw Error('Incomplete catalogue: complete pagination before updating.');
  const seen=new Set();
  return data.entries.map(e=>{
    if(!hex.test(e.template_address)||!hex.test(e.author_public_key)||!hex.test(e.binary_hash)||!e.template_name||!Number.isSafeInteger(e.at_epoch)||e.at_epoch<0||seen.has(e.template_address))throw Error('Invalid or duplicate template record.');
    seen.add(e.template_address);
    return {name:e.template_name,address:e.template_address,epoch:e.at_epoch,kind:/^0+$/.test(e.author_public_key)?'builtin':'community',binaryHash:e.binary_hash,authorPublicKey:e.author_public_key};
  }).sort((a,b)=>a.address.localeCompare(b.address));
}
export function guideInventory(data){
  if(data?.truncated!==false||!Array.isArray(data.tree)||!data.sha)throw Error('Incomplete official documentation tree.');
  const prefix='docs/developer-docs/src/content/docs/';
  const guides=data.tree.filter(e=>e.type==='blob'&&e.path.startsWith(prefix)&&/^(guides|validators)\//.test(e.path.slice(prefix.length))&&/\.mdx?$/.test(e.path));
  if(!guides.length)throw Error('Empty official guide inventory.');
  return Object.fromEntries(guides.map(e=>[e.path,{sha:e.sha,url:`https://ootle.tari.com/${e.path.slice(prefix.length).replace(/\.mdx?$/,'')}/`}]));
}
async function readRemote(url){
  const response=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}
export async function readCatalogue(read,url){
  const entries=[],seen=new Set(),pages=[];
  let next=url;
  // Official ListTemplateCatalogueRequest uses an address cursor, not an offset.
  for(let page=0;page<100;page++){
    const data=await read(next);pages.push(next);
    if(!Array.isArray(data?.entries)||data.entries.length>100)throw Error('Invalid catalogue page.');
    for(const entry of data.entries){
      if(!hex.test(entry.template_address)||seen.has(entry.template_address))throw Error('Duplicate catalogue page or address.');
      seen.add(entry.template_address);entries.push(entry);
    }
    if(data.entries.length<100)return {entries,complete:true,pages};
    next=`${url}&after=${data.entries.at(-1).template_address}`;
  }
  throw Error('Catalogue pagination limit reached; preserve the last-good snapshot.');
}
export async function monitorBuilderResources({read=readRemote,catalogue,baseline={},records=[],now=()=>new Date()}={}){
  const checkedAt=now().toISOString(),observations={},failures=[],candidates=[];
  // Independent sources continue after a failed read; no last-good file is changed here.
  for(const [id,url] of Object.entries(BUILDER_SOURCES)){
    try{
      const data=id.startsWith('indexer')?await readCatalogue(read,url):await read(url);
      observations[id]={url,data,checkedAt:read.observations?.[url]?.checkedAt||checkedAt};
    }
    catch(error){failures.push({id,url,error:error.message});}
  }
  let nextCatalogue=null,checkpoint={...baseline};
  if(observations.indexerA&&observations.indexerB){
    try{
      const a=normalizeTemplates(observations.indexerA.data),b=normalizeTemplates(observations.indexerB.data);
      if(sha(a)!==sha(b))throw Error('Mainnet indexers disagree; retain the published catalogue.');
      const previous=new Map(catalogue.entries.map(e=>[e.address,e]));
      if(catalogue.entries.some(e=>!a.some(n=>n.address===e.address)))throw Error('Catalogue lost published addresses; review before replacing the last-good snapshot.');
      nextCatalogue={network:'mainnet',checkedAt,sources:[BUILDER_SOURCES.indexerA,BUILDER_SOURCES.indexerB],entries:a.map(e=>({...e,project:previous.get(e.address)?.project||(e.kind==='builtin'?'Ootle protocol':'Community template')}))};
      for(const entry of nextCatalogue.entries){
        const old=previous.get(entry.address);
        if(!old||['name','epoch','kind','binaryHash'].some(k=>old[k]!==entry[k]))candidates.push({id:`template:${entry.address}`,kind:'template',review:old?'updated':'new',name:entry.name,url:`https://explorer.tari.mw/template/${entry.address}`});
      }
    }catch(error){failures.push({id:'templates',error:error.message});}
  }
  if(observations.release){
    try{
      const r=observations.release.data;
      if(r.draft||r.prerelease||!/^v\d+\.\d+\.\d+$/.test(r.tag_name)||!r.body||!Number.isFinite(Date.parse(r.published_at))||r.html_url!==`https://github.com/tari-project/tari-ootle/releases/tag/${r.tag_name}`)throw Error('Invalid stable release response.');
      const digest=sha({tag:r.tag_name,body:r.body});
      const listed=records.find(e=>e.sourceUrl===r.html_url&&e.sourceContentSha256===digest);
      if(!listed)candidates.push({id:`release:${r.tag_name}`,kind:'release',url:r.html_url,tag:r.tag_name,publishedAt:r.published_at,sourceContentSha256:digest});
      checkpoint.release={tag:r.tag_name,sourceContentSha256:digest};
    }catch(error){failures.push({id:'release',error:error.message});}
  }
  if(observations.guides){
    try{
      const guides=guideInventory(observations.guides.data);
      for(const [path,guide] of Object.entries(guides)){
        if(baseline.guides?.[path]?.sha!==guide.sha)candidates.push({id:`guide:${path}`,kind:'guide',review:baseline.guides?.[path]?'updated':'new',path,...guide});
      }
      for(const [path,guide] of Object.entries(baseline.guides||{}))if(!guides[path])candidates.push({id:`guide:${path}`,kind:'guide',review:'removed',path,...guide});
      checkpoint.guides=guides;
    }catch(error){failures.push({id:'guides',error:error.message});}
  }
  return {schemaVersion:1,checkedAt,complete:failures.length===0,expectedSourceIds:Object.keys(BUILDER_SOURCES),failures,candidates,nextCatalogue,checkpoint,observations};
}
export function observationReader(observations,now=new Date()){
  const read=async url=>{
    const observation=observations[url];
    if(!observation)return readRemote(url);
    const age=now.getTime()-Date.parse(observation.checkedAt);
    if(!Number.isFinite(age)||age<0||age>6*3600000||!observation.method)throw Error('Fallback observation must be a fresh, attributed source read.');
    return observation.data;
  };
  read.observations=observations;
  return read;
}
export function builderMaintenanceIssues(report,dispositions={},runDate){
  if(!report)return ['builder resources: required daily source report is missing'];
  const issues=[];
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(report.checkedAt));
  if(date!==runDate)issues.push('builder resources: source report is not from this daily invocation date');
  if(!report.complete||report.failures?.length)issues.push('builder resources: source coverage is incomplete');
  for(const id of Object.keys(BUILDER_SOURCES))if(!report.observations?.[id])issues.push(`builder resources: missing ${id} observation`);
  for(const candidate of report.candidates||[]){
    const decision=dispositions[candidate.id];
    if(!decision||!['published','duplicate','out-of-scope'].includes(decision.status)||!decision.evidence)issues.push(`builder resources: unresolved ${candidate.id}`);
  }
  return issues;
}
async function main(){
  const args=process.argv.slice(2),options={};
  for(let i=0;i<args.length;i+=2){if(!['--output','--observations'].includes(args[i])||!args[i+1])throw Error('Usage: monitor-builder-resources.mjs --output /private/dated/report.json [--observations /private/fresh-source-reads.json]');options[args[i]]=args[i+1];}
  if(!options['--output'])throw Error('A private dated output path is required.');
  const root=new URL('../',import.meta.url),json=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
  const report=await monitorBuilderResources({catalogue:json('content/mainnet-templates.json'),baseline:json('content/builder-resource-checkpoint.json'),records:json('creator-hub/hub/shared/ecosystemResources.json').records,...(options['--observations']?{read:observationReader(JSON.parse(readFileSync(options['--observations'],'utf8')))}:{})});
  const output=resolve(options['--output'])+(report.complete?'':'.partial');mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({output,complete:report.complete,candidates:report.candidates,failures:report.failures},null,2));
  if(!report.complete)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
