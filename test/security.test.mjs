import {get as httpGet} from 'node:http';
import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createInspirationLobby} from '../creator-hub/hub/server/inspirationLobby.mjs';
import {dailyTriviaRouter} from '../creator-hub/hub/server/dailyTrivia.mjs';
import {createCommunityContent} from '../creator-hub/hub/server/communityContent.mjs';
import {safeHref,requireLinkHost} from '../creator-hub/hub/shared/safeLinks.mjs';
import {publicError,SECURITY_HEADERS} from '../creator-hub/hub/server/publicSecurity.mjs';
import {buildOpenApi,OPERATIONS} from '../creator-hub/hub/server/contract/openapi.mjs';
const seed=JSON.parse(readFileSync(new URL('../creator-hub/hub/data/contests/community-content.json',import.meta.url)));
async function serve(t,app){const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>{server.closeAllConnections();server.close();});return `http://127.0.0.1:${server.address().port}`;}
test('public boundary blocks persistent writes and billable/private reads before parsing input',async t=>{
 const base=await serve(t,createInspirationLobby());
 const paths=['/api/projects','/api/assets','/api/creator-profiles','/api/skill-market','/api/community-chat/messages','/api/community-chat/messages/x/report','/api/project-chat/rooms','/api/project-chat/rooms/x/report','/api/collective-chat/rooms/x/messages','/api/creator-analytics/events','/api/engagement/resource/x/star','/api/learn/resources','/api/learning/lessons','/api/build-budgets','/api/subscriptions','/api/workbench/runs','/api/video/templates/x/draft','/api/daily-trivia/start','/api/daily-trivia/reset'];
 for(const path of paths){const response=await fetch(base+path,{method:'POST',headers:{'content-type':'application/json'},body:'invalid-json'});assert.equal(response.status,410,path);assert.doesNotMatch(await response.text(),/SyntaxError|\/Users\/|\/tmp\//);}
 for(const path of ['/api/growth/summary','/growth-export/cloud.json','/api/huggingface/search?q=x','/api/daily-trivia'])assert.equal((await fetch(base+path)).status,410,path);
 assert.equal(await new Promise((resolve,reject)=>{httpGet(base+'/api/health',{headers:{Host:'rebound.example'}},res=>{res.resume();resolve(res.statusCode);}).on('error',reject);}),403);
 const health=await fetch(base+'/api/health');assert.equal(health.status,200);assert.equal(health.headers.get('x-powered-by'),null);assert.match(health.headers.get('content-security-policy'),/frame-ancestors 'self'/);
 assert.equal((await fetch(base+'/api/new-unreviewed-write',{method:'PATCH'})).status,410);
});
test('cookie-less trivia reads never register or write; registration happens only on start',async t=>{
 let registrations=0;const state={balance:0,phase:'ready'};
 const game={get:()=>null,register:()=>{registrations++;return 'a'.repeat(36);},mutate:()=>state};
 const app=express();app.use('/trivia',dailyTriviaRouter('',{game,publicOrigin:'https://lobby.example'}));const base=await serve(t,app);
 for(let i=0;i<3;i++){const res=await fetch(base+'/trivia');assert.equal(res.status,200);assert.equal(res.headers.get('set-cookie'),null);assert.equal((await res.json()).canReset,false);}
 assert.equal(registrations,0);
 const start=await fetch(base+'/trivia/start',{method:'POST',headers:{Origin:'https://lobby.example','X-Hub-Trivia':'1'}});assert.equal(start.status,200);assert.equal(registrations,1);assert.match(start.headers.get('set-cookie'),/HttpOnly/);
});
test('served public agent contracts omit disabled operations and retain stateless exports',async t=>{
 const base=await serve(t,createInspirationLobby());
 const doc=await (await fetch(base+'/openapi.json')).json();
 assert.equal(doc['x-public-read-only'],true);
 const short=await (await fetch(base+'/llms.txt')).text();
 const full=await (await fetch(base+'/llms-full.txt')).text();
 for(const path of ['/agent-start','/agent-start.md']){
  const guide=await (await fetch(base+path)).text();
  assert.match(guide,/PUBLIC_WRITES_DISABLED/);assert.match(guide,/local/i);
  assert.doesNotMatch(guide,/save and fork\s+projects through the API/);
 }
 assert.match(short,/public read-only/);assert.match(full,/public read-only/);
 assert.doesNotMatch(full,/from POST \/api\/creator-profiles/);
 assert.equal(doc.paths['/agent-start.md'].get.responses['200'].content['text/markdown'].examples,undefined);
 for(const route of ['/learning-loop.md','/api/workflows/agent-guide']){
  const reference=await (await fetch(base+route)).text();
  assert.ok(reference.startsWith('# Local-only workflow reference\n'));
  assert.match(reference,/PUBLIC_WRITES_DISABLED/);
 }
 const stateless=/^\/api\/(?:recipes\/\{id\}\/(?:validate|export)|video\/templates\/\{id\}\/(?:validate|export)|skill-market\/\{id\}\/download)$/;
 for(const operation of OPERATIONS){
  const {method,path:route}=operation;
  const blocked=(method!=='get'&&!stateless.test(route))||route.startsWith('/api/huggingface/');
  if(blocked){
   assert.equal(doc.paths[route]?.[method],undefined,`${method} ${route}`);
   assert.ok(!full.includes(`### ${method.toUpperCase()} ${route}\n`),route);
   const response=await fetch(base+route.replace(/\{[^}]+\}/g,'contract-fixture'),{method:method.toUpperCase(),...(method!=='get'?{headers:{'content-type':'application/json'},body:'invalid-json'}:{})});
   assert.equal(response.status,410,`${method} ${route}`);
  }else{
   assert.ok(doc.paths[route]?.[method],`${method} ${route}`);
   assert.ok(full.includes(`### ${method.toUpperCase()} ${route}\n`),route);
  }
 }
 assert.ok(doc.paths['/api/skill-market/{id}/download'].post);
 assert.ok(buildOpenApi().paths['/api/projects'].post,'local contract retains legacy operations');
 for(const item of Object.values(doc.paths))for(const operation of Object.values(item)){
  if(typeof operation!=='object')continue;
  for(const requirement of operation.security||[])for(const scheme of Object.keys(requirement))assert.ok(doc.components.securitySchemes[scheme],scheme);
 }
});
test('unconfigured content never fetches; both approved revision and digest are enforced',async()=>{
 let reads=0;const changed={...seed,revision:'b'.repeat(40)};
 const unpinned=createCommunityContent({read:async()=>{reads++;return changed;}});await unpinned();assert.equal(reads,0);
 const hash=createHash('sha256').update(JSON.stringify(changed)).digest('hex');
 const approved=createCommunityContent({read:async()=>changed,approvedRevision:changed.revision,approvedSha256:hash});assert.equal((await approved()).revision,changed.revision);
 const forged=structuredClone(changed);forged.projects[0].title='Impersonated';
 const rejected=createCommunityContent({read:async()=>forged,approvedRevision:changed.revision,approvedSha256:hash});assert.equal((await rejected()).revision,seed.revision);
});
test('navigation rejects script schemes, credential URLs and protocol-relative tricks',()=>{
 for(const value of ['javascript:alert(1)','data:text/html,x','http://example.com','https://a:b@example.com','//evil.example','/\\evil.example',' https://example.com','java\nscript:alert(1)'])assert.equal(safeHref(value),undefined,value);
 assert.equal(safeHref('/skills'),'/skills');assert.equal(safeHref('https://github.com/tari-project'),'https://github.com/tari-project');
 assert.throws(()=>requireLinkHost('https://github.com.evil.example/repo'));assert.throws(()=>requireLinkHost('https://evil.example','demo'));
 assert.deepEqual(publicError(new Error('/tmp/private-file')),{status:500,body:{error:'The request could not be completed.'}});
});
test('public bundled downloads are digest-bound and never accept a runtime-created skill',async t=>{
 const base=await serve(t,createInspirationLobby());
 const catalog=await (await fetch(base+'/api/skill-market')).json();assert.equal(catalog.listings.length,196);
 const response=await fetch(base+'/api/skill-market/readable-code/download',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({visitor:'security-regression-fixture'})});
 assert.equal(response.status,200);const bundle=await response.json();
 for(const [name,body] of Object.entries(bundle.files))assert.equal(createHash('sha256').update(body).digest('hex'),bundle.sha256[name]);
 assert.equal((await fetch(base+'/api/skill-market/anonymous-skill/download',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,404);
 assert.equal((await fetch(base+'/agent-skills/hf-huggingface-community-evals/bundle.json')).status,404);
 assert.equal((await fetch(base+'/api/resources/tari-ootle%3Aapp%3Aexample')).status,404,'encoded resource IDs reach the normal catalog handler');
 const {verifyReviewedFiles}=await import('../creator-hub/hub/server/reviewedSkills.mjs');
 assert.throws(()=>verifyReviewedFiles('readable-code',{'SKILL.md':'replaced instructions'}),/review/);
});

test('CSP permits only the exact inline import maps and bundled preview code used by the product',()=>{
 const {routes}=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url)));
 assert.deepEqual(routes[0].headers,SECURITY_HEADERS);
 const csp=routes[0].headers['Content-Security-Policy'];
 for(const name of ['index.html','public/wheel-lab/native.html','public/crystal-lab/index.html','src/guessingGame/preview.ts']){
  const html=readFileSync(new URL('../creator-hub/hub/client/'+name,import.meta.url),'utf8');
  for(const [,attributes,body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
   if(attributes.includes('src='))continue;
   const digest=createHash('sha256').update(body).digest('base64');assert.ok(csp.includes("'sha256-"+digest+"'"),name);
  }
 }
 assert.match(csp,/frame-src 'self'/);assert.doesNotMatch(csp,/script-src[^;]*'unsafe-inline'/);
});
