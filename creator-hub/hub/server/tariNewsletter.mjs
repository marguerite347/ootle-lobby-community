// INTEGRATION_GAP[CFG-SUBSCRIPTIONS] (configuration-required): the provider verifies
// each short-lived Turnstile token; an approved site key/hostname and live receipt
// are required before declaring signup operational. See docs/DEVELOPMENT_GAPS.md.
import {Router, json} from 'express';
import {createHash} from 'node:crypto';

export const TARI_NEWSLETTER_ENDPOINT = 'https://rwa.y.at/miner/exchanges/user';
export const TARI_PRIVACY_URL = 'https://tari.com/privacy_policy';

export function newsletterConfiguration(env = process.env) {
  const siteKey = env.TARI_TURNSTILE_SITE_KEY?.trim();
  let origin;
  try {
    const url = new URL(env.PUBLIC_SITE_URL);
    if (url.protocol === 'https:' && url.origin === env.PUBLIC_SITE_URL) origin = url.origin;
  } catch { /* Unconfigured is a normal, closed state. */ }
  // Cloudflare's public test keys must never enable a hosted signup form.
  const available = Boolean(origin && siteKey && /^[a-zA-Z0-9_-]{10,100}$/.test(siteKey)
    && !/^[123]x0{8,}/.test(siteKey));
  return {available, siteKey: available ? siteKey : null, privacyUrl: TARI_PRIVACY_URL, signupUrl: origin ? `${origin}/ootle` : null};
}

export function validateTariSignup(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error('Enter your email address.');
  if (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()))
    throw Error('Enter a valid email address.');
  if (body.consent !== true || body.website) throw Error('Confirm that you want to receive Tari email updates.');
  if (typeof body.token !== 'string' || !body.token.trim() || body.token.length > 2048)
    throw Error('Please complete the verification and try again.');
  // Match Tari's published contract. Consent is checked here; unsupported topic,
  // confirmation and attribution fields are not invented or forwarded.
  return {email: body.email.trim().toLowerCase(), token: body.token};
}

export function createTariNewsletterRouter({env = process.env, fetcher = fetch, now = Date.now} = {}) {
  const router = Router({strict:true});
  const attempts = new Map();
  router.use((_req,res,next) => { res.set('Cache-Control','no-store'); next(); });
  router.get('/config', (_req,res) => res.json(newsletterConfiguration(env)));
  router.post('/', (req,res,next) => {
    if (!newsletterConfiguration(env).available)
      return res.status(503).json({error:'Email signup is not connected yet. Follow the Tari forum for updates.'});
    if (req.get('origin') !== env.PUBLIC_SITE_URL || req.get('x-tari-newsletter') !== '1')
      return res.status(403).json({error:'Open the signup form on the Lobby to subscribe.'});
    if (!req.is('application/json')) return res.status(415).json({error:'JSON is required.'});
    const minute = Math.floor(now()/60000);
    for (const [key,value] of attempts) if (value.minute < minute) attempts.delete(key);
    const address = createHash('sha256').update(req.ip || 'unknown').digest('hex');
    const count = attempts.get(address)?.count || 0;
    if (count >= 5 || (!attempts.has(address) && attempts.size >= 10000))
      return res.status(429).json({error:'Too many attempts. Please wait a minute and try again.'});
    attempts.set(address,{minute,count:count+1});
    next();
  }, json({limit:'8kb',strict:true}), async (req,res) => {
    let payload;
    try { payload = validateTariSignup(req.body); }
    catch (error) { return res.status(400).json({error:error.message}); }
    try {
      const response = await fetcher(TARI_NEWSLETTER_ENDPOINT, {
        method:'POST', redirect:'error', signal:AbortSignal.timeout(8000),
        headers:{'Content-Type':'application/json','Origin':env.PUBLIC_SITE_URL},
        body:JSON.stringify(payload),
      });
      // Do not automatically retry a single-use token or expose provider errors.
      if (!response.ok || (await response.json())?.success !== true) throw Error('Signup not accepted');
      return res.json({success:true,message:'You’re subscribed to Tari email updates. See you in your inbox!'});
    } catch {
      return res.status(502).json({error:'We couldn’t confirm your signup. Please verify again and retry.'});
    }
  });
  router.use((error,_req,res,next) => {
    if (error?.type === 'entity.too.large') return res.status(413).json({error:'Signup request is too large.'});
    if (error?.type === 'entity.parse.failed') return res.status(400).json({error:'Invalid signup request.'});
    next(error);
  });
  return router;
}
