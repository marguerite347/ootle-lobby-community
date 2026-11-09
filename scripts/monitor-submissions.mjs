#!/usr/bin/env node
import {readFileSync,readdirSync,mkdirSync,writeFileSync,renameSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readContestContent} from '../creator-hub/hub/shared/readContestContent.mjs';
import {monitorContest} from './monitor-contest.mjs';

const root=new URL('../',import.meta.url);
export function submissionSources(base=root){
  const creators=new URL('content/creator-submissions/',base);
  return [
    ...readContestContent(base),
    ...readdirSync(creators).filter(name=>name.endsWith('.json')).sort().map(name=>({
      ...JSON.parse(readFileSync(new URL(name,creators),'utf8')),
      id:`creator-${name.slice(0,-5)}`,
    })),
  ];
}

// Metadata-only review queue. Curation, recordings and publication remain with the daily owner automation.
export async function monitorSubmissions({sources=submissionSources(),read,now=()=>new Date()}={}){
  if(!sources.length)throw new Error('Submission source inventory must not be empty.');
  const ids=new Set(),urls=new Set();
  for(const source of sources){
    if(!source.id||ids.has(source.id)||urls.has(source.threadUrl)||!Array.isArray(source.entries))throw new Error('Duplicate or invalid submission source.');
    ids.add(source.id);urls.add(source.threadUrl);
  }
  const reports=[],failures=[];
  // Sequential reads limit load and keep one failed topic from hiding other successful reads.
  for(const contest of sources){
    try{reports.push(await monitorContest({contest,read,now}));}
    catch(error){failures.push({contestId:contest.id,threadUrl:contest.threadUrl,error:error.message});}
  }
  const candidates=reports.flatMap(report=>report.candidates);
  return {schemaVersion:1,checkedAt:now().toISOString(),complete:failures.length===0,
    expectedSourceIds:[...ids],reports,failures,
    summary:{sourcesChecked:reports.length,sourcesFailed:failures.length,
      newPosts:candidates.filter(post=>post.review==='new').length,
      editedPosts:candidates.filter(post=>post.review==='updated').length,
      missingListedSources:reports.reduce((sum,report)=>sum+report.missingListedSources.length,0)},
  };
}

export function saveSubmissionReport(report,output){
  // Never replace the last complete snapshot with a partial/error result.
  const path=resolve(output)+(report.complete?'':'.partial');
  mkdirSync(dirname(path),{recursive:true});
  writeFileSync(`${path}.tmp`,JSON.stringify(report,null,2)+'\n');renameSync(`${path}.tmp`,path);
  return path;
}

async function main(){
  const args=process.argv.slice(2);
  if(args.length&&(args.length!==2||args[0]!=='--output'))throw new Error('Usage: node scripts/monitor-submissions.mjs [--output /private/dated/submissions.json]');
  const report=await monitorSubmissions(),json=JSON.stringify(report,null,2)+'\n';
  if(args.length)saveSubmissionReport(report,args[1]);
  console.log(json);
  if(!report.complete)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
