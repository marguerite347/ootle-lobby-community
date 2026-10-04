// INTEGRATION_GAP[CFG-DATA] (configuration-required): see docs/DEVELOPMENT_GAPS.md#cfg-data.
import {listDefinitions} from './connectors/gameResourceLists.mjs';
import {readFileSync,mkdirSync,writeFileSync,renameSync} from 'node:fs';
import path from 'node:path';
import {cacheDir,seedDir,hubRoot} from './paths.mjs';
import {getJson,githubHeaders} from './connectors/http.mjs';

const storedPath=path.join(cacheDir,'source-monitoring.json');
const seedPath=path.join(seedDir,'source-monitoring.json');
const knownLists=['collections','references'].flatMap(name=>Object.values(JSON.parse(readFileSync(path.join(hubRoot,'../resources',`${name}.json`),'utf8'))).find(Array.isArray)||[]);
export const repositories=[...new Map([
 ...knownLists.map(r=>r.repository).filter(repo=>repo?.toLowerCase().includes('awesome')),
 'gamedev-skills/awesome-gamedev-agent-skills','VoltAgent/awesome-agent-skills',
 'Unity-Technologies/unity-agent-plugin','huggingface/skills','remotion-dev/skills','elodin-sys/open-air',
 ...listDefinitions.map(source=>source.repo), 'Stanestane/game-design-skills-bundle',
].map(repo=>[repo.toLowerCase(),repo])).values()];
const INTERVAL=6*60*60*1000;
let schedule={enabled:false,running:false,intervalMs:INTERVAL,nextCheckAt:null,lastRunAt:null};
let cached;
function load(){if(cached)return cached;for(const file of [storedPath,seedPath]){try{return cached=JSON.parse(readFileSync(file,'utf8'));}catch{}}return cached={};}
export function extractLinks(markdown){return [...new Set(markdown.match(/https?:\/\/[^\s<>"\])]+/g)||[])].sort();}
export async function checkRepository(repo,previous,{request=getJson,now=new Date().toISOString()}={}){
 const options={headers:githubHeaders(),timeoutMs:12000};
 try{
  const info=await request(`https://api.github.com/repos/${repo}`,options);
  if(info.private)throw Error('Only public repositories can be monitored');
  const readme=await request(`https://api.github.com/repos/${repo}/readme`,options);
  if(!info.pushed_at||!readme.sha||readme.encoding!=='base64'||typeof readme.content!=='string')throw Error('Incomplete GitHub metadata');
  const links=extractLinks(Buffer.from(readme.content,'base64').toString('utf8'));
  const changed=!!previous?.sha&&previous.sha!==readme.sha;
  return {lastAttemptAt:now,lastSuccessAt:now,pushedAt:info.pushed_at,archived:!!info.archived,sha:readme.sha,links,
   changes:changed?{checkedAt:now,added:links.filter(link=>!(previous.links||[]).includes(link)),removed:(previous.links||[]).filter(link=>!links.includes(link))}:previous?.changes||null,
   baselineAt:previous?.baselineAt||now,error:null};
 }catch(error){return {...previous,lastAttemptAt:now,error:error.message};}
}
export async function refreshSourceMonitoring(){
 const next={...load()};
 for(const repo of repositories)next[repo]=await checkRepository(repo,next[repo]);
 mkdirSync(cacheDir,{recursive:true});
 const temporary=`${storedPath}.${process.pid}.tmp`;
 writeFileSync(temporary,JSON.stringify(next,null,2));renameSync(temporary,storedPath);cached=next;
 return next;
}
export function monitoringStatus(){return {...schedule,scope:'README links and repository metadata; discoveries need review before import. Checks run only while the Hub server runs.'};}
export function monitoredSources(){
 const state=load();const now=Date.now();
 const entries=repositories.map(repo=>{
  const item=state[repo]||{};
  const age=item.lastSuccessAt?now-Date.parse(item.lastSuccessAt):Infinity;
  return {id:`watch:${repo.toLowerCase()}`,name:repo,kind:'github-monitor',canonicalUrl:`https://github.com/${repo}`,native:false,recordCount:0,
   ingestion:'Scheduled checks of GitHub repository activity and README links while the Hub runs. Newly found links await review; nothing is installed automatically.',
   freshness:item.error?(item.lastSuccessAt?'stale':'failed'):age>INTERVAL*2?(item.lastSuccessAt?'stale':'unavailable'):'current',
   lastAttemptAt:item.lastAttemptAt||null,lastSuccessAt:item.lastSuccessAt||null,
   note:item.error||(!item.sha?'Awaiting first check.':item.archived?'Archived upstream.':now-Date.parse(item.pushedAt)<30*86400000?'Repository pushed within the last 30 days; this does not prove every listed resource is maintained.':'No repository push in the last 30 days.'),
   monitoring:{pushedAt:item.pushedAt||null,readmeSha:item.sha||null,linkCount:item.links?.length||0,changes:item.changes||null,baselineAt:item.baselineAt||null},
  };
 });
 entries.sort((a,b)=>(b.monitoring.pushedAt||'').localeCompare(a.monitoring.pushedAt||''));
 return [...entries,{id:'envato',name:'Envato · stock, templates & browser creation',kind:'manual',canonicalUrl:'https://app.envato.com/',native:false,recordCount:0,freshness:'provisional',lastSuccessAt:null,lastAttemptAt:null,
 ingestion:'Licensed stock footage, music, SFX, templates and browser creation. Manual review required; no authenticated catalog/update connector is installed.',note:'Requires your own applicable license, signed-in browser and credits where needed. Check new releases in Envato; the Hub cannot verify account entitlement or claim this catalog is current.'}];
}
export function startSourceMonitoring({intervalMs=Number(process.env.CREATOR_HUB_SOURCE_WATCH_MS??INTERVAL),initialDelayMs=10000,run=refreshSourceMonitoring}={}){
 if(!Number.isFinite(intervalMs)||intervalMs<0||(intervalMs>0&&intervalMs<60000))throw Error('CREATOR_HUB_SOURCE_WATCH_MS must be 0 or at least 60000');
 schedule={...schedule,enabled:intervalMs>0,intervalMs};
 if(!intervalMs)return()=>{};
 let stopped=false,timer;
 const plan=delay=>{schedule.nextCheckAt=new Date(Date.now()+delay).toISOString();timer=setTimeout(tick,delay);timer.unref?.();};
 const tick=async()=>{schedule.running=true;schedule.nextCheckAt=null;try{await run();schedule.lastRunAt=new Date().toISOString();}catch(error){console.warn('[source-monitoring]',error.message);}finally{schedule.running=false;if(!stopped)plan(intervalMs);}};
 plan(initialDelayMs);
 return()=>{stopped=true;clearTimeout(timer);schedule.enabled=false;schedule.nextCheckAt=null;};
}
