// Public preview is a discovery site. Stateful services require separate authenticated storage.
// GLTF ImageBitmapLoader fetches embedded textures from browser-created blob URLs.
// Permit those local reads while keeping network connections same-origin.
export const SECURITY_HEADERS = {
 'Content-Security-Policy': "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'sha256-uv6C8SvVZ2uUoElK/37yraYA/Qn8kTC1yiCLJejNULI=' 'sha256-qKixQ4y904xNw2jTHruM0+UBwTAc9DhJD9mahJM1kto=' 'sha256-Yp37/7aVh3/vRQbARTMM99meTkuheBYNtQJqdF6tUS0=' 'sha256-pY4WOiR15dITZlysG3bMhlFrjZHw0+5QIMTCMg1jt+I=' 'sha256-AWQUp1nz9D6XkCxLSQ9gtzwlCas2qYd1frBbUh4z3jU=' 'sha256-YVtyz1pt1ciOxyHdOSC8Mf0P/KbuOU/2yEBo2+yU9U0='; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' blob:; worker-src 'self' blob:; frame-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'",
 'Strict-Transport-Security':'max-age=31536000',
 'X-Content-Type-Options':'nosniff',
 'X-Frame-Options':'SAMEORIGIN',
 'Referrer-Policy':'no-referrer',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
};
export function securityHeaders(req,res,next) {res.removeHeader('X-Powered-By');res.set(SECURITY_HEADERS);next();}
export function publicError(error) {
 const status=Number.isInteger(error?.status)&&error.status>=400&&error.status<500?error.status:500;
 return {status,body:{error:status===500?'The request could not be completed.':error.expose===true?error.message:({400:'Invalid request.',401:'Authentication required.',403:'Request not permitted.',404:'Not found.',409:'Request conflicts with current state.',413:'Request is too large.',429:'Too many requests.'}[status]||'Request rejected.')}};
}
export function localHostGuard(req,res,next) {
 if(process.env.VERCEL==='1')return next();
 const allowed=new Set(['localhost','127.0.0.1','[::1]']);
 if(process.env.PUBLIC_SITE_URL)allowed.add(new URL(process.env.PUBLIC_SITE_URL).hostname);
 let host;
 try{host=new URL(`http://${req.get('host')}`).hostname;}catch{return res.status(400).json({error:'Invalid Host.'});}
 if(!allowed.has(host))return res.status(403).json({error:'Unrecognized Host.'});
 next();
}
