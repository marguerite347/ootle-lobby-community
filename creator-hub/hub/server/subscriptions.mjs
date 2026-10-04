// INTEGRATION_GAP[CFG-SUBSCRIPTIONS] (configuration-required): see docs/DEVELOPMENT_GAPS.md#cfg-subscriptions.
import {createHash} from 'node:crypto';
const topics = ['launch','events','journal'];
export function subscriptionConfiguration(env=process.env) {
  const configured = Boolean(env.SUBSCRIPTION_WEBHOOK_URL?.startsWith('https://') && env.SUBSCRIPTION_WEBHOOK_TOKEN && env.SUBSCRIPTION_PRIVACY_URL?.startsWith('https://'));
  return {available:configured,privacyUrl:configured?env.SUBSCRIPTION_PRIVACY_URL:null};
}
export function validateSubscription(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Enter your email and choose your updates.');
  if (typeof body.email!=='string' || body.email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) throw new Error('Enter a valid email address.');
  if(body.consent!==true || !Array.isArray(body.topics) || !body.topics.length || body.topics.some(topic=>!topics.includes(topic))) throw new Error('Choose your updates and confirm your subscription.');
  if(body.website) throw new Error('Unable to accept this submission.');
  return {email:body.email.trim().toLowerCase(),topics:[...new Set(body.topics)].sort(),consentVersion:'2026-09-23',source:'creator-hub',doubleOptIn:true};
}
export function createSubscriptionHandler({env=process.env,fetcher=fetch,now=Date.now}={}) {
  const attempts=new Map();
  return async (req,res)=>{
    res.set('Cache-Control','no-store');
    if(!subscriptionConfiguration(env).available) return res.status(503).json({error:'Email signup is not connected yet. Please check back soon.'});
    let payload;
    try {payload=validateSubscription(req.body);} catch(error){return res.status(400).json({error:error.message});}
    const minute=Math.floor(now()/60000);
    for(const [key,value] of attempts) if(value.minute<minute) attempts.delete(key);
    const address=createHash('sha256').update(req.ip||'unknown').digest('hex');
    const count=attempts.get(address)?.count||0;
    if(count>=5 || attempts.size>=10000) return res.status(429).json({error:'Too many attempts. Please wait a minute and try again.'});
    attempts.set(address,{minute,count:count+1});
    try {
      const key=createHash('sha256').update(JSON.stringify(payload)+Math.floor(now()/86400000)).digest('hex');
      const response=await fetcher(env.SUBSCRIPTION_WEBHOOK_URL,{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),headers:{'Content-Type':'application/json','Authorization':`Bearer ${env.SUBSCRIPTION_WEBHOOK_TOKEN}`,'Idempotency-Key':key},body:JSON.stringify({...payload,consentedAt:new Date(now()).toISOString()})});
      if(!response.ok) throw new Error('Provider failed');
      const result=await response.json();
      if(result.status!=='pending_confirmation') throw new Error('Provider did not confirm handoff');
      return res.status(202).json({status:'pending_confirmation',message:'Check your inbox to confirm your subscription. You are not subscribed until you confirm.'});
    } catch {return res.status(502).json({error:'We could not complete signup. Please try again later.'});}
  };
}
