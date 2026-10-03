import {mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const runtime = new URL('../work/runtime/',import.meta.url);
mkdirSync(runtime,{recursive:true});
process.env.CREATOR_HUB_DATA_DIR ||= fileURLToPath(runtime);
process.env.CREATOR_HUB_REFRESH_MS ||= '0';
process.env.CREATOR_HUB_SOURCE_WATCH_MS ||= '0';
await import('../creator-hub/hub/server/index.mjs');
