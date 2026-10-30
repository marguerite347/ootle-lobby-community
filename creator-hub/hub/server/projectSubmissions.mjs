// INTEGRATION_GAP[LOBBY-SUBMISSIONS] (configuration-required): durable private intake;
// publication remains a reviewed repository change. See docs/PROJECT_SUBMISSIONS.md.
import {Router, json} from 'express';
import {createHash, createHmac, randomBytes, randomUUID, timingSafeEqual} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {isIP} from 'node:net';
import {publicError} from './publicSecurity.mjs';

export const OCTOBER_THREAD = 'https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396';
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status,expose:true});};
const sha=value=>createHash('sha256').update(value).digest('hex');
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function text(value,label,min,max){
  if(typeof value!=='string')fail(`Enter ${label}.`);
  const clean=value.trim();
  if(clean.length<min||clean.length>max||/[\u0000-\u0008\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(clean))fail(`Enter ${label} (${min}–${max} characters).`);
  return clean;
}
function publicUrl(value,label,required=false){
  if(!value&&!required)return '';
  const input=text(value,label,8,1500);
  let url;try{url=new URL(input);}catch{fail(`Enter a full HTTPS URL for ${label}.`);}
  if(url.protocol!=='https:'||url.username||url.password||!url.hostname.includes('.')||/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)||/\.(local|internal|localhost)$/.test(url.hostname))fail(`Use a public HTTPS URL for ${label}.`);
  return url.href;
}
export function validateProjectSubmission(body){
  if(!body||typeof body!=='object'||Array.isArray(body))fail('Enter your project details.');
  if(!uuid.test(body.clientId||''))fail('Refresh this form and try again.');
  if(body.website||body.consent!==true)fail('Confirm that these project details may be reviewed and published.');
  if(!['community','october-2026'].includes(body.destination))fail('Choose where to share your project.');
  const submission={destination:body.destination,title:text(body.title,'a project name',2,100),creator:text(body.creator,'your name or handle',1,80),summary:text(body.summary,'a short project description',20,1200),projectUrl:publicUrl(body.projectUrl,'your project link',true),repoUrl:publicUrl(body.repoUrl,'source code',body.destination==='october-2026'),forumUrl:publicUrl(body.forumUrl,'your creator post',body.destination==='october-2026')};
  if(submission.destination==='october-2026'){
    const url=new URL(submission.forumUrl);
    const match=url.pathname.match(/^\/t\/(?:[^/]+\/)?396\/(\d+)\/?$/);
    if(url.hostname!=='community.tari.com'||!match||Number(match[1])<2||url.search||url.hash)fail('Link your individual entry in the official October contest thread.');
  }
  return {clientId:body.clientId,submission};
}

/** Backend-only database. No files, URLs or submitted code are fetched/executed. */
export function createProjectSubmissionStore(db){
  // Hosted schema installation is an operator migration, never a public request.
  const ready=()=>db.query('SELECT id FROM lobby_intake.submissions LIMIT 0');
  const receipt=row=>({id:row.id,receivedAt:row.created_at,status:row.status});
  async function limit(q,key,max){
    const {rows}=await q.query(`INSERT INTO lobby_intake.limits(key,window_at,count) VALUES($1,now(),1)
      ON CONFLICT(key) DO UPDATE SET count=CASE WHEN lobby_intake.limits.window_at<now()-interval '1 hour' THEN 1 ELSE lobby_intake.limits.count+1 END,
      window_at=CASE WHEN lobby_intake.limits.window_at<now()-interval '1 hour' THEN now() ELSE lobby_intake.limits.window_at END RETURNING count`,[key]);
    if(rows[0].count>max)fail('Too many submissions. Please try again later.',429);
  }
  return {
    ready,
    async submit({clientId,submission},addressKey){
      await ready();
      const payload=JSON.stringify(submission),fingerprint=sha(payload);
      return db.transaction(async q=>{
        const prior=(await q.query('SELECT * FROM lobby_intake.submissions WHERE client_id=$1',[clientId])).rows[0];
        if(prior){if(prior.payload_hash!==fingerprint)fail('This receipt belongs to different details. Start a new submission.',409);return receipt(prior);}
        await limit(q,'ip:'+addressKey,3);await limit(q,'global',100);
        const id=randomUUID();
        await q.query(`INSERT INTO lobby_intake.submissions(id,client_id,payload,payload_hash) VALUES($1,$2,$3::jsonb,$4) ON CONFLICT(client_id) DO NOTHING`,[id,clientId,payload,fingerprint]);
        const saved=(await q.query('SELECT * FROM lobby_intake.submissions WHERE client_id=$1',[clientId])).rows[0];
        if(saved.payload_hash!==fingerprint)fail('This receipt belongs to different details. Start a new submission.',409);
        await q.query("DELETE FROM lobby_intake.limits WHERE window_at<now()-interval '2 days'");
        return receipt(saved);
      });
    },
    async list(offset=0){
      if(!Number.isSafeInteger(offset)||offset<0||offset>100000)fail('Invalid queue page.');
      const {rows}=await db.query('SELECT id,payload,status,created_at,reviewed_at,review_note FROM lobby_intake.submissions ORDER BY created_at DESC,id DESC LIMIT 51 OFFSET $1',[offset]);
      return {items:rows.slice(0,50),nextOffset:rows.length>50?offset+50:null};
    },
    async review(id,{status,note},reviewer){
      if(!uuid.test(id)||!['pending','reviewed','declined','test'].includes(status))fail('Invalid review.');
      const cleanNote=note?text(note,'a review note',1,1000):'';
      await ready();
      return db.transaction(async q=>{
        const {rows}=await q.query('UPDATE lobby_intake.submissions SET status=$2,reviewed_at=now(),review_note=$3 WHERE id=$1 RETURNING id,status',[id,status,cleanNote]);
        if(!rows.length)fail('Submission not found.',404);
        await q.query('INSERT INTO lobby_intake.reviews(id,submission_id,reviewer,status,note) VALUES($1,$2,$3,$4,$5)',[randomUUID(),id,reviewer,status,cleanNote]);
        return rows[0];
      });
    },
  };
}

// Only for local setup/tests. Hosted deployments apply the SQL via the provider.
export const installProjectSubmissionSchema=db=>db.exec(readFileSync(new URL('./projectSubmissions.sql',import.meta.url),'utf8'));

export function createProjectSubmissionsRouter({store,origin,secret,now=Date.now}={}){
  const router=Router({strict:true}),configured=Boolean(store&&origin&&secret?.length>=32);
  const sign=value=>createHmac('sha256',secret).update('lobby-project-form:'+value).digest('hex');
  const issueChallenge=()=>{const value=`${now()}.${randomBytes(16).toString('hex')}`;return `${value}.${sign(value)}`;};
  function verifyChallenge(token){
    if(typeof token!=='string'||!/^\d{13}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token))return false;
    const [time,nonce,signature]=token.split('.'),age=now()-Number(time);
    return age>=0&&age<30*60_000&&timingSafeEqual(Buffer.from(signature),Buffer.from(sign(`${time}.${nonce}`)));
  }
  router.use((_req,res,next)=>{res.set('Cache-Control','no-store');next();});
  router.get('/config',async(_req,res)=>{
    if(!configured)return res.json({available:false,forumUrl:OCTOBER_THREAD});
    try{await store.ready();res.json({available:true,challenge:issueChallenge(),forumUrl:OCTOBER_THREAD});}
    catch{res.status(503).json({available:false,error:'Project submissions are temporarily unavailable.'});}
  });
  router.post('/',(req,res,next)=>{
    if(!configured)return res.status(503).json({error:'Project submissions are temporarily unavailable.'});
    if(req.get('origin')!==origin||req.get('x-lobby-submission')!=='1')return res.status(403).json({error:'Open the submission form on the Lobby.'});
    if(!req.is('application/json'))return res.status(415).json({error:'JSON is required.'});
    next();
  },json({limit:'12kb',strict:true}),async(req,res)=>{
    try{
      if(!verifyChallenge(req.body.challenge))fail('Your form expired. Refresh the form and try again.');
      const input=validateProjectSubmission(req.body);
      // Vercel overwrites this header. Local/self-hosted requests use the socket.
      const forwarded=process.env.VERCEL==='1'?req.get('x-forwarded-for')?.split(',')[0]?.trim():null;
      const address=forwarded&&isIP(forwarded)?forwarded:req.socket.remoteAddress||'unknown';
      const addressKey=createHmac('sha256',secret).update(`lobby-intake:${new Date(now()).toISOString().slice(0,10)}:${address}`).digest('hex');
      const receipt=await store.submit(input,addressKey);
      res.status(201).json({receipt});
    }catch(error){const result=publicError(error);res.status(result.status).json(result.body);}
  });
  router.use((error,_req,res,next)=>{
    if(error?.type==='entity.too.large')return res.status(413).json({error:'Project details are too long.'});
    if(error?.type==='entity.parse.failed')return res.status(400).json({error:'Invalid submission.'});
    next(error);
  });
  router.use((_req,res)=>res.status(404).json({error:'Not found.'}));
  return router;
}
