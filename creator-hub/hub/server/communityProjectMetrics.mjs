// INTEGRATION_GAP[COMMUNITY-METRICS] (build-required): see docs/DEVELOPMENT_GAPS.md#community-metrics.
import {readFileSync} from 'node:fs';
import {getJson,githubHeaders} from './connectors/http.mjs';
import {fetchContestPosts,submissionComments} from './contestMetrics.mjs';
const seed=JSON.parse(readFileSync(new URL('../data/community-project-metrics.json',import.meta.url),'utf8'));
export async function refreshCommunityMetrics(projects, previous={items:{}}, read=getJson, now=Date.now()) {
 const checkedAt=new Date(now).toISOString();
 const results=await Promise.all(projects.map(async p=>{
  const saved=previous.items?.[p.slug];
  const prior={github:saved?.github?.url===`${p.repoUrl}/stargazers`?saved.github:null,forum:p.forum&&saved?.forum?.url===p.forum.url?saved.forum:null};
  const [github,forum]=await Promise.allSettled([
   p.repoUrl?read(p.repoUrl.replace('https://github.com/','https://api.github.com/repos/'),{headers:githubHeaders(),timeoutMs:5000}):null,
   p.forum?fetchContestPosts(read,p.forum.topicId):null,
  ]);
  const repo=github.status==='fulfilled'?github.value:null;
  const validRepo=Number.isInteger(repo?.stargazers_count)&&repo.stargazers_count>=0;
  const posts=forum.status==='fulfilled'?forum.value:null;
  const comments=posts?.some(post=>post.post_number===p.forum?.postNumber)?(p.forum.scope==='topic'?posts.filter(post=>post.post_number!==p.forum.postNumber&&post.post_type===1).length:submissionComments(posts,p.forum.postNumber)):null;
  return [p.slug,{
   github:p.repoUrl?{count:validRepo?repo.stargazers_count:prior?.github?.count??null,pushedAt:validRepo&&Number.isFinite(Date.parse(repo.pushed_at))?repo.pushed_at:prior?.github?.pushedAt??null,url:`${p.repoUrl}/stargazers`,activityUrl:`${p.repoUrl}/activity`,checkedAt:validRepo?checkedAt:prior?.github?.checkedAt??null}:null,
   forum:{count:comments??prior?.forum?.count??null,url:p.forum?.url||'',checkedAt:comments!==null?checkedAt:prior?.forum?.checkedAt??null}
  }];
 }));
 return {checkedAt,items:Object.fromEntries(results)};
}

function metricProjects(feed) {
 const october=(feed.contests||[]).filter(contest=>contest.id==='october-2026').flatMap(contest=>contest.entries.map(p=>({
  ...p, slug:`october:${p.slug}`,
  repoUrl:/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(p.repoUrl)?p.repoUrl:null,
  forum:{url:p.sourceUrl,topicId:396,postNumber:Number(p.sourceUrl.split('/').at(-1)),scope:'replies'},
 })));
 return [...(feed.communityProjects||[]),...october];
}
export function createCommunityProjectMetrics({content,read=getJson,now=Date.now,initial=seed}={}) {
 let snapshot=initial,nextRefresh=0,pending;
 return async()=>{
  if(now()<nextRefresh)return snapshot;
  if(!pending)pending=content().then(feed=>refreshCommunityMetrics(metricProjects(feed),snapshot,read,now())).then(result=>(snapshot=result)).catch(()=>snapshot).finally(()=>{nextRefresh=now()+86400000;pending=undefined;});
  return pending;
 };
}
