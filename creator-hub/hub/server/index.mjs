import {startSourceMonitoring} from './sourceMonitoring.mjs';
import { startSourceRefresh } from './sourceRefresh.mjs';
import {createInspirationLobby} from './inspirationLobby.mjs';
import * as catalog from './catalog.mjs';

const PORT = Number(process.env.PORT || 4180);
const HOST = process.env.HOST || '127.0.0.1';

catalog.load();
catalog.watchCatalog();

const app = createInspirationLobby();
app.listen(PORT, HOST, () => {
  const m = catalog.meta();
  console.log(`Ootle Lobby on http://${HOST}:${PORT}  (${m.records} catalog records from ${m.sources?.length || 0} sources)`);
  const featured = [...catalog.collections().flatMap(collection => collection.items), ...catalog.search({sort: 'popular'}).slice(0, 6)];
  const missingVideos = new Set(featured.filter(resource => !resource.preview?.video).map(resource => resource.id));
  if (missingVideos.size) console.warn(`[media] ${missingVideos.size} featured resources have no video. Attach the reviewed preview library and run npm run media:check -- http://${HOST}:${PORT}`);
});

startSourceRefresh();

startSourceMonitoring();
