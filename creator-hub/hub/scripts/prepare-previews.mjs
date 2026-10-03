#!/usr/bin/env node
// Assemble app previews into the served previews dir + an index.json.
//
// For each app in the capture list, use its real webpage capture. Generic
// AppCover fallback media is retired under VIDEO_PREVIEW_POLICY.md. Copies media into previewsDir (served at /previews) and
// writes index.json (name/url/slug/source/image/video) that the catalog uses to
// attach previews. Media stays out of Git; this is a runtime assembly step.
//
// Usage: node scripts/prepare-previews.mjs

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import {coverSlugs} from '../../video-templates/src/cover.mjs';
import { hubRoot, previewsDir, previewIndex } from '../server/paths.mjs';

const captureDir = path.resolve(hubRoot, '..', 'capture', 'out');
// Master app list (with optional URLs) also drives cover rendering.
const appsFile = path.resolve(hubRoot, '..', 'video-templates', 'props', 'app-directory.json');

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const doc = JSON.parse(readFileSync(appsFile, 'utf8'));
const apps = (Array.isArray(doc) ? doc : doc.apps || []).filter((a) => a.name);
coverSlugs(apps);
mkdirSync(previewsDir, { recursive: true });
const manifestPath=path.join(captureDir,'manifest.json');
const captures=existsSync(manifestPath)?JSON.parse(readFileSync(manifestPath,'utf8')):[];

const index = [];
for (const app of apps) {
  const s = slug(app.name);
  const capMp4 = path.join(captureDir, `${s}.mp4`);
  const capPoster = path.join(captureDir, `${s}.poster.png`);
  const outMp4 = path.join(previewsDir, `${s}.mp4`);
  const outPoster = path.join(previewsDir, `${s}.poster.png`);

  let source = null;
  rmSync(outPoster,{force:true});
  const evidence=captures.find(e=>e.slug===s && e.url===app.url && e.captured===true);
  if (evidence && existsSync(capMp4)) {
    copyFileSync(capMp4, outMp4);
    if (existsSync(capPoster)) copyFileSync(capPoster, outPoster);
    else spawnSync('ffmpeg', ['-y', '-ss', '3', '-i', outMp4, '-frames:v', '1', outPoster], { stdio: 'ignore' });
    source = 'capture';
  } else {
    console.warn(`- ${app.name}: no verified capture found; source imagery remains available`);
    continue;
  }

  index.push({
    name: app.name,
    url: app.url || null,
    slug: s,
    source,
    image: existsSync(outPoster) ? `/previews/${s}.poster.png` : null,
    video: `/previews/${s}.mp4`,
  });
  console.log(`✓ ${app.name} (${source})`);
}

writeFileSync(previewIndex+'.tmp', JSON.stringify(index, null, 2));
renameSync(previewIndex+'.tmp',previewIndex);
console.log(`\nWrote ${index.length} previews -> ${previewIndex}`);
