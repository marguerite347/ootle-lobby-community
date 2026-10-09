// INTEGRATION_GAP[RETIRED-HOSTING] (retired): see docs/DEVELOPMENT_GAPS.md#retired-hosting.
// INTEGRATION_GAP[WB-AUTH] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-auth.
import express from 'express';
import {securityHeaders,localHostGuard} from './publicSecurity.mjs';
import {createWorkbenchRouter} from './workbench.mjs';
import {createApp} from './app.mjs';

/** Only these routes compute bounded responses without persisting visitor data. */
export function preventProjectHosting(req, res, next) {
  let pathname;
  try{pathname=decodeURIComponent(req.path);}catch{return res.status(400).json({error:'Invalid request path.'});}
  if (/\\|\/\//.test(pathname) || (!['GET','HEAD','OPTIONS'].includes(req.method)&&pathname!==req.path))return res.status(400).json({error:'Noncanonical request path.'});
  if (/^\/(?:api\/(?:daily-trivia|growth|huggingface)(?:\/|$)|growth-export(?:\/|$))/i.test(pathname)) {
    return res.status(410).json({error:'This service is not available on the public Lobby.',code:'PUBLIC_SERVICE_DISABLED'});
  }
  if (['GET','HEAD','OPTIONS'].includes(req.method)) return next();
  const stateless=req.method==='POST' && (/^\/api\/(?:recipes|video\/templates)\/[a-zA-Z0-9_-]+\/(?:validate|export)\/?$/.test(pathname) || /^\/api\/skill-market\/[a-zA-Z0-9_-]+\/download\/?$/.test(pathname));
  if(stateless)return next();
  return res.status(410).json({error:'Community contributions are read-only here. Propose changes through the project repository.',code:'PUBLIC_WRITES_DISABLED'});
}

/** Public entry point; the original app remains available for legacy store tests. */
export function createInspirationLobby({workbenchServices}={}) {
  const lobby = express();
  lobby.disable('x-powered-by');
  lobby.use(securityHeaders,localHostGuard,preventProjectHosting);
  lobby.use('/api/workbench', createWorkbenchRouter(workbenchServices));
  lobby.use(createApp({publicReadOnly:true}));
  return lobby;
}
