#!/usr/bin/env node
// Capture real webpages, assemble runtime previews, then report resources needing
// individually reviewed replacements under VIDEO_PREVIEW_POLICY.md.
// Generic generated covers are retired. --no-covers is retained as a legacy flag.
// Usage: node scripts/build-previews.mjs [--no-capture] [--no-covers]

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { hubRoot } from '../server/paths.mjs';

const flags = new Set(process.argv.slice(2));
const videoDir = path.resolve(hubRoot, '..', 'video-templates');
const captureDir = path.resolve(hubRoot, '..', 'capture');

function run(label, cmd, args, cwd, { required = false } = {}) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  if (r.status !== 0) {
    const msg = `  ${label} failed (exit ${r.status ?? 'signal'})`;
    if (required) { console.error(msg); process.exit(r.status || 1); }
    console.warn(`${msg} — continuing`);
    return false;
  }
  return true;
}

function ensureDeps(dir) {
  if (!existsSync(path.join(dir, 'node_modules'))) return run(`install deps in ${path.basename(dir)}`, 'npm', ['ci'], dir);
  return true;
}

// 2. Real webpage captures (best-effort; needs Chrome + ffmpeg + egress).
if (!flags.has('--no-capture')) {
  if (ensureDeps(captureDir) && run('install capture recorder', 'npm', ['run', 'setup:video'], captureDir)) {
    run('capture app webpages', process.execPath, ['capture-apps.mjs'], captureDir);
  }
}

// 3. Assemble the served previews dir + index (always).
run('prepare previews', process.execPath, ['scripts/prepare-previews.mjs'], hubRoot, { required: true });

if (!flags.has('--no-covers')) {
  run('audit source-specific preview replacements', process.execPath, ['scripts/render-discovery.mjs'], videoDir, { required: true });
}

console.log('\n✓ Preview index assembled. Only real captures and individually reviewed source-grounded generated previews are eligible. Missing previews retain original source imagery where available. Serve with the hub; set CREATOR_HUB_PREVIEWS_DIR to override the location.');
