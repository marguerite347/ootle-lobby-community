// Resolve a resource's reviewed album artwork by exact catalog ID. Original
// upstream video is preserved; captured webpages match by URL/title only when
// no approved resource artwork is available. Media is served at /previews.

import { readFileSync, existsSync, watchFile } from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {approvedGeneratedPreview} from './preview-policy.mjs';
import { previewIndex, previewsDir, seedPreviewIndex, seedPreviewsDir } from './paths.mjs';

let usedCoverHashes = new Set();
let byId = new Map();
let byUrl = new Map();
let bySlug = new Map();

export function canonicalUrl(url) {
  try {
    const u = new URL(url);
    if(!['https:','http:'].includes(u.protocol)||u.username||u.password)return null;
    return (u.host.toLowerCase() + u.pathname).replace(/\/$/, '') + u.search;
  } catch {
    return null;
  }
}

export function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Apply one index file, validating each media path against its own directory.
// Later calls overlay earlier ones (runtime wins over the committed seed).
function applyIndex(indexFile, mediaDir) {
  if (!existsSync(indexFile)) return;
  try {
    const entries = JSON.parse(readFileSync(indexFile, 'utf8'));
    for (const e of Array.isArray(entries) ? entries : []) {
      const local = value => typeof value==='string' && /^\/previews\/[a-z0-9-]+\.(mp4|poster\.png)$/.test(value) && existsSync(path.join(mediaDir,path.basename(value))) ? value : null;
      const image=local(e.image), video=local(e.video);
      if(e.source!=='capture') {
        if(!approvedGeneratedPreview(e) || !video)continue;
        const hash=createHash('sha256').update(readFileSync(path.join(mediaDir,path.basename(video)))).digest('hex');
        if(hash!==e.review.videoSha256 || usedCoverHashes.has(hash))continue;
        usedCoverHashes.add(hash);
      }
      const preview = { image, video, source: e.source==='capture'?'Recorded webpage · not gameplay':'Animated album artwork · illustration' };
      if(!preview.image && !preview.video)continue;
      if (e.id) byId.set(e.id, preview);
      if(e.source!=='capture')continue; // Generated previews never match another resource by title/URL.
      const c = canonicalUrl(e.url);
      if (c) byUrl.set(c, preview);
      if (e.slug) bySlug.set(e.slug, preview);
    }
  } catch {
    /* leave existing maps on a malformed index */
  }
}

export function load() {
  usedCoverHashes = new Set();
  byId = new Map();
  byUrl = new Map();
  bySlug = new Map();
  applyIndex(seedPreviewIndex, seedPreviewsDir); // committed source posters are the base
  applyIndex(path.join(previewsDir, 'catalog-index.json'), previewsDir); // restored library upgrades posters
  applyIndex(previewIndex, previewsDir);         // runtime captures/covers (overlay)
}

export function watchPreviews() {
  watchFile(path.join(previewsDir,'catalog-index.json'),{persistent:false,interval:1000},()=>load());
  watchFile(previewIndex,{persistent:false,interval:1000},()=>load());
  watchFile(seedPreviewIndex,{persistent:false,interval:1000},()=>load());
}

// Original upstream videos remain intact. Reviewed album art takes priority over
// automatically captured webpage previews in the gallery.
// Catalog covers match stable IDs; source images remain the fallback.
export function previewFor(r) {
  if (!r || r.preview?.video) return r?.preview || null;
  const match = r.type === 'app' ? [r.demoUrl,r.sourceUrl,r.repoUrl].map(canonicalUrl).filter(Boolean).map(c=>byUrl.get(c)).find(Boolean) || bySlug.get(slugify(r.title)) : null;
  return byId.get(r.id) || (match?.video ? match : null) || r.preview || match || null;
}
