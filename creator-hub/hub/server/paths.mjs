// INTEGRATION_GAP[LOBBY-CHAT] (build-required): see docs/DEVELOPMENT_GAPS.md#lobby-chat.
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const serverDir = path.dirname(fileURLToPath(import.meta.url));
export const hubRoot = path.resolve(serverDir, '..');

// Committed seed always lives with the code.
export const seedDir = path.join(hubRoot, 'data', 'seed');
export const seedCatalog = path.join(seedDir, 'catalog.json');

// Runtime state (ingest cache + published project repos) can be redirected to an
// isolated directory via CREATOR_HUB_DATA_DIR (used by tests and the environment).
export const runtimeDir = process.env.CREATOR_HUB_DATA_DIR || path.join(hubRoot, 'data');
export const cacheDir = path.join(runtimeDir, 'cache');
export const projectsDir = path.join(runtimeDir, 'projects');
export const cacheCatalog = path.join(cacheDir, 'catalog.json');

// Generated app previews (captures/covers). Media stays out of Git; a run copies
// files here and writes index.json. Served read-only at /previews.
// CREATOR_HUB_PREVIEWS_DIR is the explicit override. Journey harnesses set PREVIEWS_DIR.
export const previewsDir = process.env.CREATOR_HUB_PREVIEWS_DIR || process.env.PREVIEWS_DIR || path.join(runtimeDir, 'previews');
export const previewIndex = path.join(previewsDir, 'index.json');

// Committed seed previews: small cover POSTERS + index so a fresh instance shows
// album-cover thumbnails without any runtime step. Real capture clips overlay
// these at runtime (see scripts/prepare-previews.mjs).
export const seedPreviewsDir = path.join(seedDir, 'previews');
export const seedPreviewIndex = path.join(seedPreviewsDir, 'index.json');

export const clientDist = path.join(hubRoot, 'client', 'dist');
export const clientPublic = path.join(hubRoot, 'client', 'public');
