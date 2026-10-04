// INTEGRATION_GAP[RETIRED-HOSTING] (retired): see docs/DEVELOPMENT_GAPS.md#retired-hosting.
// INTEGRATION_GAP[WB-AUTH] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-auth.
import express from 'express';
import {createWorkbenchRouter} from './workbench.mjs';
import {createApp} from './app.mjs';

/** Keep legacy records readable, but never accept new hosted creator work. */
export function preventProjectHosting(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  let pathname;
  try { pathname = decodeURIComponent(req.path).toLowerCase(); }
  catch { return res.status(400).json({error: 'Invalid request path.'}); }
  const storesCreatorWork = /^\/api\/(?:projects(?:\/|$)|assets(?:\/|$)|recipes\/[^/]+\/projects\/?$|challenges\/submissions\/?$)/.test(pathname);
  if (!storesCreatorWork) return next();
  return res.status(410).json({
    error: 'The Lobby no longer saves or hosts projects. Download your work, build with your own tools, and share a public link in the Tari community.',
    code: 'PROJECT_HOSTING_RETIRED',
  });
}

/** Public entry point; the original app remains available for legacy store tests. */
export function createInspirationLobby({workbenchServices}={}) {
  const lobby = express();
  lobby.use(preventProjectHosting);
  lobby.use('/api/workbench', createWorkbenchRouter(workbenchServices));
  lobby.use(createApp());
  return lobby;
}
