#!/usr/bin/env node
// INTEGRATION_GAP[OPS-OCTOBER-CHANNEL] (build-required): see docs/DEVELOPMENT_GAPS.md#ops-october-channel.
import {mkdirSync,writeFileSync,renameSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readContestContent} from '../creator-hub/hub/shared/readContestContent.mjs';
const root=new URL('../',import.meta.url);
async function getJSON(url){
  const response=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error(`Forum returned HTTP ${response.status}`);
  return response.json();
}
// Candidates are public post metadata only. Never copy wallet addresses or raw posts.
export async function monitorContest({read=getJSON,contest=readContestContent(root)[0],now=()=>new Date()}={}){
  const topic=await read('https://community.tari.com/t/396.json');
  if(topic.id!==396||!Array.isArray(topic.post_stream?.stream)||!Array.isArray(topic.post_stream?.posts))throw new Error('Unexpected forum topic response.');
  const stream=topic.post_stream.stream;
  if(!stream.length||stream.some(id=>!Number.isInteger(id)||id<1)||new Set(stream).size!==stream.length)throw new Error('Invalid forum post stream.');
  const posts=new Map(topic.post_stream.posts.map(post=>[post.id,post]));
  const missing=stream.filter(id=>!posts.has(id));
  for(let i=0;i<missing.length;i+=20){
    const query=missing.slice(i,i+20).map(id=>`post_ids[]=${id}`).join('&');
    const batch=await read(`https://community.tari.com/t/396/posts.json?${query}`);
    if(!Array.isArray(batch.post_stream?.posts))throw new Error('Missing forum post batch.');
    for(const post of batch.post_stream.posts)posts.set(post.id,post);
  }
  if(stream.some(id=>!posts.has(id)))throw new Error('Incomplete forum snapshot; previous report must be retained.');
  const normal=stream.map(id=>posts.get(id)).filter(post=>post.post_type===1&&post.post_number>1&&!post.deleted_at);
  const reviewed=new Map(contest.entries.map(entry=>[entry.sourceUrl,entry]));
  const candidates=normal.map(post=>{
    if(!Number.isInteger(post.post_number)||!Number.isFinite(Date.parse(post.created_at))||!Number.isFinite(Date.parse(post.updated_at))||typeof post.cooked!=='string')throw new Error('Incomplete submission post.');
    const sourceUrl=`${contest.threadUrl}/${post.post_number}`;
    const entry=reviewed.get(sourceUrl);
    const contentSha256=createHash('sha256').update(post.cooked).digest('hex');
    return {postId:post.id,postNumber:post.post_number,sourceUrl,creator:post.username,publishedAt:post.created_at,updatedAt:post.updated_at,
      contentSha256,
      review:!entry?'new':entry.sourceContentSha256!==contentSha256?'updated':'listed'};
  });
  return {schemaVersion:1,contestId:contest.id,threadUrl:contest.threadUrl,checkedAt:now().toISOString(),complete:true,
    observedPostIds:stream,observedSubmissionPosts:normal.length,candidates};
}
async function main(){
  const args=process.argv.slice(2),index=args.indexOf('--output');
  if(args.length && (index!==0||args.length!==2))throw new Error('Usage: node scripts/monitor-contest.mjs [--output work/october-monitor.json]');
  const report=await monitorContest();
  const json=JSON.stringify(report,null,2)+'\n';
  if(index===0){const path=resolve(args[1]);mkdirSync(dirname(path),{recursive:true});writeFileSync(`${path}.tmp`,json);renameSync(`${path}.tmp`,path);}
  console.log(json);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
