// INTEGRATION_GAP[CFG-DATA] (configuration-required): see docs/DEVELOPMENT_GAPS.md#cfg-data.
import {gameResourceConnectors} from './connectors/gameResourceLists.mjs';
import { ingest, writeSnapshot } from './ingest.mjs';

// Runs in the app process, independent of any agent/editor. No overlapping jobs.
export function startSourceRefresh({ intervalMs = Number(process.env.CREATOR_HUB_REFRESH_MS ?? 3600000),
  run = async () => writeSnapshot(await ingest({ only: ['ootle-apps-directory', 'tari-wiki-apps', ...gameResourceConnectors.map(connector => connector.source.id)], enrich: false })),
  onError = e => console.warn('[source-refresh]', e.message), initialDelayMs = 5000 } = {}) {
  if (intervalMs === 0) return () => {};
  if (!Number.isFinite(intervalMs) || intervalMs < 60000) throw new Error('CREATOR_HUB_REFRESH_MS must be 0 or at least 60000');
  let stopped = false;
  let timer;
  const tick = async () => {
    try { await run(); } catch (e) { onError(e); }
    finally { if (!stopped) { timer = setTimeout(tick, intervalMs); timer.unref?.(); } }
  };
  timer = setTimeout(tick, initialDelayMs);
  timer.unref?.();
  return () => { stopped = true; clearTimeout(timer); };
}
