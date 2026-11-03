// INTEGRATION_GAP[COMMUNITY-CALENDAR-METRICS] (configuration-required): backend-only estimates, not a count of people. See docs/DEVELOPMENT_GAPS.md.
import {Router, json} from 'express';
import {createHash, createHmac, randomUUID, timingSafeEqual} from 'node:crypto';
import {isIP} from 'node:net';
import {communityCalendar, COMMUNITY_CALENDAR_URL} from './communityCalendar.mjs';

const providers=['google','apple','download'];
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const hash=value=>createHash('sha256').update(value).digest('hex');
const reject=(status,message)=>{throw Object.assign(new Error(message),{status});};
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
const noStore=res=>res.set({'Cache-Control':'private, no-store','CDN-Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store','Referrer-Policy':'no-referrer'});
const automated=req=>/bot|crawler|spider|headless|lighthouse/i.test(req.get('user-agent')||'') || /prefetch|prerender/i.test(`${req.get('purpose')||''} ${req.get('sec-purpose')||''}`);

/** Only opaque hashes and activity timestamps/counts; never email, account IDs, raw IP or user-agent. */
export function createCalendarMetricsStore(db,{now=()=>new Date()}={}) {
  const stamp=()=>now().toISOString();
  async function limit(q,key,max,at) {
    const {rows}=await q.query(`INSERT INTO lobby_calendar.limits(key,window_at,count) VALUES($1,$2,1)
      ON CONFLICT(key) DO UPDATE SET count=CASE WHEN lobby_calendar.limits.window_at<$2::timestamptz-interval '1 hour' THEN 1 ELSE lobby_calendar.limits.count+1 END,
      window_at=CASE WHEN lobby_calendar.limits.window_at<$2::timestamptz-interval '1 hour' THEN $2 ELSE lobby_calendar.limits.window_at END RETURNING count`,[key,at]);
    if(rows[0].count>max)reject(429,'Too many calendar requests. Please try again later.');
  }
  return {
    async issue(links,addressKey) {
      const at=stamp();
      await db.transaction(async q=>{
        await limit(q,'options:'+addressKey,120,at);await limit(q,'options:global',5000,at);
        for(const link of links)await q.query('INSERT INTO lobby_calendar.links(token_hash,provider,created_at) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[link.hash,link.provider,at]);
        await q.query("DELETE FROM lobby_calendar.limits WHERE window_at<$1::timestamptz-interval '2 days'",[at]);
        await q.query("DELETE FROM lobby_calendar.actions WHERE created_at<$1::timestamptz-interval '90 days'",[at]);
      });
    },
    async click(tokenHash,provider,id,addressKey) {
      const at=stamp();
      await db.transaction(async q=>{
        await limit(q,'click:'+addressKey,300,at);await limit(q,'click:global',15000,at);
        await q.query(`INSERT INTO lobby_calendar.actions(id,token_hash,kind,created_at)
          SELECT $1,token_hash,'click',$4 FROM lobby_calendar.links WHERE token_hash=$2 AND provider=$3 ON CONFLICT(id) DO NOTHING`,[id,tokenHash,provider,at]);
      });
    },
    async fetched(tokenHash,provider) {
      const at=stamp();
      if(provider==='download') {
        await db.query(`WITH requested AS (UPDATE lobby_calendar.links SET last_download_at=$3
          WHERE token_hash=$2 AND provider='download' AND (last_download_at IS NULL OR last_download_at<$3::timestamptz-interval '1 minute') RETURNING token_hash)
          INSERT INTO lobby_calendar.actions(id,token_hash,kind,created_at) SELECT $1,token_hash,'download',$3 FROM requested`,[randomUUID(),tokenHash,at]);
      } else await db.query(`UPDATE lobby_calendar.links SET first_fetched_at=COALESCE(first_fetched_at,$3),last_fetched_at=$3,
        last_repeat_at=CASE WHEN first_fetched_at<=$3::timestamptz-interval '6 hours' THEN $3 ELSE last_repeat_at END,fetch_count=fetch_count+1
        WHERE token_hash=$1 AND provider=$2 AND (last_fetched_at IS NULL OR last_fetched_at<$3::timestamptz-interval '5 minutes')`,[tokenHash,provider,at]);
    },
    async report() {
      const at=stamp();
      const {rows}=await db.query(`SELECT p.provider,
        (SELECT count(*)::int FROM lobby_calendar.actions a JOIN lobby_calendar.links l USING(token_hash) WHERE NOT l.excluded AND l.provider=p.provider AND a.kind='click' AND a.created_at >= $1::timestamptz-interval '30 days') AS clicks,
        (SELECT count(DISTINCT a.token_hash)::int FROM lobby_calendar.actions a JOIN lobby_calendar.links l USING(token_hash) WHERE NOT l.excluded AND l.provider=p.provider AND a.kind='click' AND a.created_at >= $1::timestamptz-interval '30 days') AS selected_links,
        (SELECT count(*)::int FROM lobby_calendar.actions a JOIN lobby_calendar.links l USING(token_hash) WHERE NOT l.excluded AND l.provider=p.provider AND a.kind='download' AND a.created_at >= $1::timestamptz-interval '30 days') AS download_requests,
        (SELECT count(*)::int FROM lobby_calendar.links l WHERE NOT l.excluded AND l.provider=p.provider AND l.last_fetched_at >= $1::timestamptz-interval '14 days') AS observed_feed_links,
        (SELECT count(*)::int FROM lobby_calendar.links l WHERE NOT l.excluded AND l.provider=p.provider AND l.last_repeat_at >= $1::timestamptz-interval '14 days') AS estimated_active_subscriptions
        FROM (VALUES('google'),('apple'),('download')) p(provider)`,[at]);
      const {rows:meta}=await db.query('SELECT started_at FROM lobby_calendar.metadata WHERE id=1');
      return {generatedAt:at,trackingStartedAt:meta[0]?.started_at??null,actionWindowDays:30,activityWindowDays:14,minimumRepeatHours:6,providers:rows,
        totals:rows.reduce((sum,row)=>{for(const key of Object.keys(sum))sum[key]+=row[key];return sum;},{clicks:0,selected_links:0,download_requests:0,observed_feed_links:0,estimated_active_subscriptions:0}),
        limitations:['Feed links are estimates, not verified people or provider-confirmed subscriptions.','Repeated fetches at least six hours after the first, seen in the last 14 days, qualify as estimated active.','Existing shared-feed subscribers and earlier downloads are not measurable retroactively.','A download request does not confirm an import. Requests for the same download within one minute are deduplicated. Shared links, bots, multiple browsers, blocked tracking and provider caching affect counts.','Test links are excluded. Raw action records expire after 90 days; reports use the last 30 days.']};
    }
  };
}

export function createCalendarMetricsRouter({store,origin,secret,now=Date.now}={}) {
  const router=Router();
  const configured=Boolean(store&&origin&&secret?.length>=32);
  const signature=(provider,id)=>createHmac('sha256',secret).update(`tari-calendar-v1:${provider}:${id}`).digest('hex');
  function validToken(provider,token) {
    if(!configured||!providers.includes(provider)||typeof token!=='string')return false;
    const parts=token.split('.');
    return parts.length===2&&uuid.test(parts[0])&&/^[a-f0-9]{64}$/.test(parts[1])&&timingSafeEqual(Buffer.from(parts[1]),Buffer.from(signature(provider,parts[0])));
  }
  const addressKey=req=>{
    const forwarded=process.env.VERCEL==='1'?req.get('x-forwarded-for')?.split(',')[0]?.trim():null;
    const address=forwarded&&isIP(forwarded)?forwarded:req.socket.remoteAddress||'unknown';
    return createHmac('sha256',secret).update(`calendar-limit:${new Date(now()).toISOString().slice(0,10)}:${address}`).digest('hex');
  };
  router.use(['/community/calendar','/api/calendar'],(_req,res,next)=>{noStore(res);next();});
  router.get('/community/calendar/:provider/:token.ics',wrap(async(req,res)=>{
    const {provider,token}=req.params;
    // Calendar access must survive analytics outages/secret rotation. Unknown links
    // receive the same public feed, but can never register or inflate metrics.
    if(req.method==='GET'&&!automated(req)&&validToken(provider,token)) {
      try {await store.fetched(hash(token),provider);}catch {console.warn('Calendar metrics write unavailable');}
    }
    res.set({'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':`${provider==='download'?'attachment':'inline'}; filename="tari-community.ics"`}).send(communityCalendar());
  }));
  router.use('/api/calendar',(req,res,next)=>{
    if(!configured)return res.status(503).json({error:'Calendar measurement is unavailable.'});
    if(req.method!=='POST')return res.status(405).json({error:'POST required.'});
    if(req.get('origin')!==origin||req.get('x-lobby-calendar')!=='1')return res.status(403).json({error:'Open calendar options on the Lobby.'});
    if(automated(req)||req.get('sec-gpc')==='1'||req.get('dnt')==='1')return res.status(403).json({error:'Use the shared calendar link.'});
    if(!req.is('application/json'))return res.status(415).json({error:'JSON required.'});
    next();
  },json({limit:'2kb',strict:true}));
  router.post('/api/calendar/options',wrap(async(req,res)=>{
    if(!uuid.test(req.body.clientId||''))reject(400,'Invalid calendar link ID.');
    const links=providers.map(provider=>{const token=`${req.body.clientId}.${signature(provider,req.body.clientId)}`;return {provider,token,hash:hash(token)};});
    await store.issue(links,addressKey(req));
    const options={};
    for(const {provider,token} of links) {
      const feedUrl=`${origin}/community/calendar/${provider}/${token}.ics`,webcal=feedUrl.replace(/^https:/,'webcal:');
      options[provider]={token,href:provider==='google'?`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`:provider==='apple'?webcal:feedUrl};
    }
    res.json({options,sharedFeed:COMMUNITY_CALENDAR_URL});
  }));
  router.post('/api/calendar/actions',wrap(async(req,res)=>{
    const {provider,token,id}=req.body;
    if(!uuid.test(id||'')||!validToken(provider,token))reject(400,'Invalid calendar action.');
    await store.click(hash(token),provider,id,addressKey(req));res.status(204).end();
  }));
  router.use((error,_req,res,_next)=>res.status(error.status||503).json({error:error.status===400?'Invalid calendar request.':error.status===429?'Too many calendar requests.':'Calendar measurement is unavailable.'}));
  return router;
}
