import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import express from 'express';
import {createProjectSubmissionStore,installProjectSubmissionSchema,createProjectSubmissionsRouter,validateProjectSubmission,OCTOBER_THREAD} from '../creator-hub/hub/server/projectSubmissions.mjs';
import {createChatStore,installSchema} from '../creator-hub/hub/server/community/store.mjs';
import {createCommunityRouter} from '../creator-hub/hub/server/community/router.mjs';
import {createInspirationLobby} from '../creator-hub/hub/server/inspirationLobby.mjs';
const origin='https://lobby.tari.com',secret='test-only-'.repeat(5);
const input=(extra={})=>({clientId:randomUUID(),destination:'community',title:'Trial project',creator:'Test builder',summary:'A fictional test project using Tari, for private intake verification.',projectUrl:'https://example.com/project',repoUrl:'',forumUrl:'',website:'',consent:true,...extra});
async function serve(t,app){const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);}));return `http://127.0.0.1:${server.address().port}`;}
const headers={'Content-Type':'application/json','X-Lobby-Submission':'1',Origin:origin};

test('intake validates destinations, public links, consent and individual October posts',()=>{
  assert.equal(validateProjectSubmission(input()).submission.title,'Trial project');
  const contest=input({destination:'october-2026',repoUrl:'https://github.com/example/project',forumUrl:OCTOBER_THREAD+'/34'});
  assert.equal(validateProjectSubmission(contest).submission.destination,'october-2026');
  for(const extra of [{destination:'official'},{consent:false},{website:'spam'},{title:'x'},{creator:'a'.repeat(81)},{summary:'short'},{title:'bad\u202e'},{clientId:'invalid'},{projectUrl:'javascript:alert(1)'},{projectUrl:'http://example.com'},{projectUrl:'https://127.0.0.1/a'},{projectUrl:'https://user:password@example.com'},{projectUrl:'https://private.local'}])assert.throws(()=>validateProjectSubmission(input(extra)),{status:400});
  for(const extra of [{repoUrl:''},{forumUrl:OCTOBER_THREAD},{forumUrl:OCTOBER_THREAD+'/1'},{forumUrl:OCTOBER_THREAD+'/34?x=1'},{forumUrl:'https://example.com/t/396/34'}])assert.throws(()=>validateProjectSubmission({...contest,...extra}),{status:400});
});

test('durable private intake survives restart, deduplicates retries and enforces atomic limits',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'lobby-intake-'));let db=new PGlite(directory);
  t.after(async()=>{await db.close();await rm(directory,{recursive:true,force:true});});
  await installProjectSubmissionSchema(db);let store=createProjectSubmissionStore(db);const data=validateProjectSubmission(input());
  const first=await store.submit(data,'one');
  const retries=await Promise.all(Array.from({length:4},()=>store.submit(data,'one')));
  assert.ok(retries.every(r=>r.id===first.id));
  await assert.rejects(()=>store.submit({...data,submission:{...data.submission,title:'Changed'}},'one'),{status:409});
  await store.submit(validateProjectSubmission(input()),'one');await store.submit(validateProjectSubmission(input()),'one');
  await assert.rejects(()=>store.submit(validateProjectSubmission(input()),'one'),{status:429});
  assert.equal((await store.list()).items.length,3);
  await db.close();db=new PGlite(directory);store=createProjectSubmissionStore(db);
  assert.equal((await store.submit(data,'one')).id,first.id);
  assert.equal((await store.list()).items.length,3);
  await store.review(first.id,{status:'test',note:'Do not publish.'},'owner-test');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM lobby_intake.reviews')).rows[0].n,1);
  assert.equal((await store.submit(data,'one')).status,'test');
  await db.query("UPDATE lobby_intake.limits SET window_at=now()-interval '2 hours'");
  await store.submit(validateProjectSubmission(input()),'one');
  await db.query("UPDATE lobby_intake.limits SET count=100 WHERE key='global'");
  await assert.rejects(()=>store.submit(validateProjectSubmission(input()),'different'),{status:429});
  assert.equal((await store.list()).items.length,4);
});

test('only the restricted backend role can use the private schema',async t=>{
  const db=new PGlite();t.after(()=>db.close());await installProjectSubmissionSchema(db);
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE ootle_chat_preview;');
  await db.exec(await readFile(new URL('../creator-hub/hub/server/projectSubmissionGrants.sql',import.meta.url),'utf8'));
  for(const role of ['anon','authenticated']){
    await db.exec(`SET ROLE ${role}`);
    await assert.rejects(()=>db.query('SELECT * FROM lobby_intake.submissions'),{code:'42501'});
    await db.exec('RESET ROLE');
  }
  await db.exec('SET ROLE ootle_chat_preview');
  const store=createProjectSubmissionStore(db);await store.ready();
  const saved=await store.submit(validateProjectSubmission(input()),'limited-role');
  await store.review(saved.id,{status:'test',note:''},'owner');
  assert.equal((await store.list()).items.length,1);
  await assert.rejects(()=>db.query('DELETE FROM lobby_intake.submissions'),{code:'42501'});
});

test('public entry point saves receipts, rejects CSRF/oversize/expired challenges and never exposes queue',async t=>{
  const db=new PGlite();t.after(()=>db.close());await installProjectSubmissionSchema(db);const store=createProjectSubmissionStore(db);
  const url=await serve(t,createInspirationLobby({communityServices:{},submissionServices:{store,origin,secret}}));
  const config=await fetch(url+'/api/project-submissions/config').then(r=>r.json());assert.equal(config.available,true);
  const body={...input(),challenge:config.challenge};
  const send=(extraHeaders={},payload=body)=>fetch(url+'/api/project-submissions',{method:'POST',headers:{...headers,...extraHeaders},body:JSON.stringify(payload)});
  assert.equal((await send({Origin:'https://evil.example'})).status,403);
  assert.equal((await send({'X-Lobby-Submission':'0'})).status,403);
  assert.equal((await send({}, {...body,challenge:config.challenge.slice(0,-1)+'x'})).status,400);
  assert.equal((await send({}, {...body,summary:'a'.repeat(13000)})).status,413);
  const r=await send();assert.equal(r.status,201);const saved=await r.json();assert.deepEqual(Object.keys(saved.receipt).sort(),['id','receivedAt','status']);
  assert.equal((await (await send()).json()).receipt.id,saved.receipt.id);
  assert.equal((await fetch(url+'/api/project-submissions')).status,404);
  assert.equal((await fetch(url+'/api/projects',{method:'POST',headers,body:'{}'})).status,410);
  assert.equal((await store.list()).items.length,1);
  const app=express();let time=Date.now();app.use('/intake',createProjectSubmissionsRouter({store,origin,secret,now:()=>time}));const expiring=await serve(t,app);
  const old=await fetch(expiring+'/intake/config').then(r=>r.json());time+=31*60_000;
  assert.equal((await fetch(expiring+'/intake',{method:'POST',headers,body:JSON.stringify({...input(),challenge:old.challenge})})).status,400);
});

test('database failure never produces a success receipt or leaks database details',async t=>{
  const app=express();app.use(createProjectSubmissionsRouter({store:{ready:async()=>{throw Error('secret database connection');}},origin,secret}));const url=await serve(t,app);
  const response=await fetch(url+'/config');assert.equal(response.status,503);const result=await response.json();assert.equal(result.available,false);assert.doesNotMatch(JSON.stringify(result),/secret database/);
});

test('moderation requires owner or moderator session and origin, with paginated retrieval',async t=>{
  const db=new PGlite();t.after(()=>db.close());await installSchema(db);await installProjectSubmissionSchema(db);
  const chat=createChatStore(db),intake=createProjectSubmissionStore(db);
  await chat.login({id:1,login:'Owner'},{ownerId:'1'});await chat.login({id:2,login:'Member'},{allowedIds:['2']});
  await chat.createSession('github-1','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');await chat.createSession('github-2','bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
  const saved=await intake.submit(validateProjectSubmission(input()),'review-test');
  const app=express();app.use('/api/chat',createCommunityRouter({store:chat,origin,projectSubmissions:{store:intake}}));const url=await serve(t,app);
  for(const cookie of ['', 'ootle_chat_session=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'])assert.equal((await fetch(url+'/api/chat/project-submissions',{headers:{Cookie:cookie}})).status,403);
  const admin={Cookie:'ootle_chat_session=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',Origin:origin,'X-Ootle-Chat':'1','Content-Type':'application/json'};
  const queue=await fetch(url+'/api/chat/project-submissions',{headers:admin}).then(r=>r.json());assert.equal(queue.items[0].id,saved.id);assert.equal(queue.nextOffset,null);
  assert.equal((await fetch(url+'/api/chat/project-submissions?offset=-1',{headers:admin})).status,400);
  const endpoint=url+`/api/chat/project-submissions/${saved.id}/review`;
  assert.equal((await fetch(endpoint,{method:'POST',headers:{...admin,Origin:'https://evil.example'},body:'{}'})).status,403);
  assert.equal((await fetch(endpoint,{method:'POST',headers:admin,body:JSON.stringify({status:'test',note:'QA only'})})).status,200);
  assert.equal((await intake.list()).items[0].status,'test');
  // Fill more than one page without exercising the unrelated public rate limit.
  for(let n=0;n<51;n++)await db.query('INSERT INTO lobby_intake.submissions(id,client_id,payload,payload_hash) VALUES($1,$2,$3::jsonb,$4)',[randomUUID(),randomUUID(),'{}','test']);
  const page=await intake.list();assert.equal(page.items.length,50);assert.equal(page.nextOffset,50);assert.equal((await intake.list(50)).items.length,2);
});
