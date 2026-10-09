// INTEGRATION_GAP[OPS-DEPLOY] (configuration-required): see docs/DEVELOPMENT_GAPS.md#ops-deploy.
// INTEGRATION_GAP[WB-AUTH] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-auth.
import express from 'express';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
process.env.CREATOR_HUB_DATA_DIR = join(tmpdir(), 'ootle-lobby-preview');
process.env.PUBLIC_SITE_URL = 'https://ootle-lobby-preview.vercel.app';
// The public browser practice game does not use server trivia storage.
delete process.env.TRIVIA_ALLOW_RESET;
const catalog = await import('../server-content/creator-hub/hub/server/catalog.mjs');
const {createInspirationLobby} = await import('../server-content/creator-hub/hub/server/inspirationLobby.mjs');
catalog.load();
const app = express();
app.disable('x-powered-by');
// Vercel terminates the public request at one trusted proxy hop.
app.set('trust proxy', 1);
app.use((req,res,next)=>{res.set('X-Robots-Tag','noindex, nofollow');next();});
app.get('/robots.txt',(req,res)=>res.type('text/plain').send('User-agent: *\nDisallow: /\n'));
app.use(createInspirationLobby());
export default app;
