#!/usr/bin/env node
// INTEGRATION_GAP[LOBBY-VIDEO] (design-only): see docs/DEVELOPMENT_GAPS.md#lobby-video.
// Capture short clips of live community app webpages for Ootle Lobby previews.
//
// Drives an installed Chrome via playwright-core (no bundled browser download),
// loads each app URL, does a gentle scripted scroll, and records ~12s of the real
// page. Output is real third-party footage — accurate, not an endorsement and not
// a security review. Apps that need a wallet/interaction will only show their
// landing state; unreachable apps remain recording-pending. Covers do not satisfy recordings.
//
// Requirements: system `ffmpeg` on PATH; an installed Chrome; network egress to
// the app domains. Outputs (out/) are git-ignored.
//
// Usage: node capture-apps.mjs [appsFile] [outDir]

import { chromium } from 'playwright-core';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, renameSync } from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const appsFile = process.argv[2] || 'apps.json';
const outDir = process.argv[3] || 'out';
const W = 1280, H = 800, CLIP_SECONDS = 12;

function chromePath() {
  const env = process.env.CHROME_PATH || process.env.REMOTION_BROWSER_EXECUTABLE;
  const candidates = [env, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome-stable', '/opt/google/chrome/chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return candidates.find((p) => p && existsSync(p)) || null;
}

export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export async function captureOne(browser, app, outDir, run = spawnSync) {
  const out = path.join(outDir, `${slug(app.name)}.mp4`);
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: outDir, size: { width: W, height: H } },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
  });
  let page;
  let ok = true;
  try {
    page = await ctx.newPage();
    const response = await page.goto(app.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!response || !response.ok()) throw new Error(`HTTP ${response?.status() ?? 'no response'}`);
    await page.waitForTimeout(3500);
    // Discard navigation/loading. Scroll in continuous eased animation frames,
    // rather than jumping 320px between mouse-wheel events.
    await page.evaluate(async (focused) => {
      const root = document.scrollingElement || document.documentElement;
      const prior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      const base = focused ? window.scrollY : 0;
      window.scrollTo(0, base);
      const hold = ms => new Promise(resolve => setTimeout(resolve, ms));
      const travel = (from, to, duration) => new Promise(resolve => {
        const start = performance.now();
        const frame = now => {
          const t = Math.min(1, (now-start)/duration);
          const eased = (1-Math.cos(Math.PI*t))/2;
          window.scrollTo(0, from+(to-from)*eased);
          if(t<1) requestAnimationFrame(frame); else resolve();
        };
        requestAnimationFrame(frame);
      });
      try {
        await hold(focused ? 2000 : 1000);
        const distance = Math.min(focused ? 350 : 1800, Math.max(0, root.scrollHeight-innerHeight-base));
        await travel(base,base+distance,focused ? 2000 : 5000);
        if(focused) await hold(4000);
        await travel(base+distance,base,focused ? 2000 : 5000);
        await hold(focused ? 2000 : 1000);
      } finally { root.style.scrollBehavior = prior; }
    }, app.focused === true);
  } catch (e) {
    ok = false;
    console.error(`  ! ${app.name}: ${e.message.split('\n')[0]}`);
  }
  const video = page?.video();
  await ctx.close();
  if (!ok || !video) { if(video) await video.delete().catch(()=>{}); return null; }
  const webm = await video.path();
  const poster = path.join(outDir, `${slug(app.name)}.poster.png`);
  try {
    const t = run('ffmpeg', ['-y', '-sseof', String(-CLIP_SECONDS), '-i', webm, '-t', String(CLIP_SECONDS), '-an', ...(app.cropBottom ? ['-vf', `crop=iw:ih-${app.cropBottom}`] : []), '-c:v', 'libx264', '-crf', '20', '-movflags', '+faststart', '-pix_fmt', 'yuv420p', out], { encoding: 'utf8' });
    if(t.status !== 0) throw new Error(`MP4 transcode failed: ${t.error?.message || t.stderr?.trim().split('\n').slice(-3).join(' ') || t.status}`);
    const p = run('ffmpeg', ['-y', '-ss', '3', '-i', out, '-frames:v', '1', poster], {stdio:'ignore'});
    if(p.status !== 0) throw new Error('Poster generation failed');
    if (app.preserveRaw) renameSync(webm, path.join(outDir, `${slug(app.name)}.raw.webm`));
    return out;
  } catch(e) {
    rmSync(out,{force:true});rmSync(poster,{force:true});
    console.error(`  ! ${app.name}: ${e.message}`);return null;
  } finally { if (!app.preserveRaw) await video.delete().catch(()=>{}); }

}

export function validateApps(apps) {
  if(!Array.isArray(apps)||!apps.length)throw new Error('Provide at least one app.');
  const names=new Set();
  for(const app of apps){
    if(typeof app.name!=='string'||!slug(app.name)||names.has(slug(app.name)))throw new Error('App names need unique nonempty filename slugs.');
    names.add(slug(app.name));
    if(app.cropBottom!==undefined && (!Number.isInteger(app.cropBottom)||app.cropBottom<0||app.cropBottom>160||app.cropBottom%2))throw new Error('Invalid capture crop.');
    const url=new URL(app.url);
    if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('App URLs must be public http(s) URLs without credentials.');
  }
  return apps;
}

async function main() {
  const exe = chromePath();
  if (!exe) { console.error('No Chrome found. Set CHROME_PATH to a Chrome/Chromium binary.'); process.exit(2); }
  if(spawnSync('ffmpeg',['-version'],{stdio:'ignore'}).status!==0) throw new Error('Install ffmpeg on PATH first.');
  const doc = JSON.parse(readFileSync(appsFile, 'utf8'));
  const apps = validateApps(Array.isArray(doc) ? doc : doc.apps || []);
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ executablePath: exe, headless: true, chromiumSandbox: true, args: ['--disable-dev-shm-usage'] });
  const manifest = [];
  try { for (const app of apps) {
    process.stdout.write(`- ${app.name} …\n`);
    let out = await captureOne(browser, app, outDir).catch(() => null);
    if (!out) {
      console.log('  Retrying once in the same browser session');
      out = await captureOne(browser, app, outDir).catch(() => null);
    }
    manifest.push({ name: app.name, url: app.url, slug: slug(app.name), category: app.category || null, status: app.status || null, captured: !!out, output: out || null, rawOutput: out && app.preserveRaw ? path.join(outDir, `${slug(app.name)}.raw.webm`) : null, capturedAt: new Date().toISOString(), note: app.caption || 'Live third-party page capture; not an endorsement or security review.' });
    console.log(out ? `  ✓ ${out}` : `  ✗ skipped (unreachable/failed) — recording pending; a generated cover is not a recording`);
  }
  } finally { await browser.close(); }
  writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const ok = manifest.filter((m) => m.captured).length;
  console.log(`\nCaptured ${ok}/${apps.length}. Manifest: ${path.join(outDir, 'manifest.json')}`);
}

if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) main().catch((e) => { console.error(e); process.exit(1); });
