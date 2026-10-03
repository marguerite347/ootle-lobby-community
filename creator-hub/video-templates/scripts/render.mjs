#!/usr/bin/env node
// Render a template AND write an export manifest beside the video.
//
// The manifest retains project/template/campaign/clip IDs, the tracked
// destination link, an input hash and pinned tool versions, so a clip can be
// tied to visits and downstream creator actions (VIDEO_WORKFLOWS.md contracts +
// METRICS.md carry-through). Large media stays out of Git; the manifest is the
// small, reviewable record.
//
// Usage: node scripts/render.mjs <TemplateId> <propsFile> <outFile>

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { TEMPLATES } from '../src/schemas.mjs';
import { dimsFor, FPS } from '../src/format.mjs';

const require = createRequire(import.meta.url);
const [templateId, propsFile, outFile] = process.argv.slice(2);

if (!templateId || !propsFile || !outFile) {
  console.error('Usage: node scripts/render.mjs <TemplateId> <propsFile> <outFile>');
  process.exit(2);
}

const schema = TEMPLATES[templateId];
if (!schema) {
  console.error(`Unknown template "${templateId}". Known: ${Object.keys(TEMPLATES).join(', ')}`);
  process.exit(2);
}

const rawProps = JSON.parse(readFileSync(propsFile, 'utf8'));
const parsed = schema.safeParse(rawProps);
if (!parsed.success) {
  console.error(`Invalid props for ${templateId}:`);
  for (const issue of parsed.error.issues) console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  process.exit(1);
}
const props = parsed.data;

// Render the same validated snapshot that is hashed in the manifest. Resolve
// the composition and installed CLI relative to this module, not the caller.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(outFile);
if (existsSync(output) || existsSync(`${output}.manifest.json`)) {
  console.error('Output already exists. Choose a new filename to preserve this clip revision.');
  process.exit(1);
}
mkdirSync(path.dirname(output), { recursive: true });
const temp = mkdtempSync(path.join(tmpdir(), 'tari-video-props-'));
try {
  const snapshot = path.join(temp, 'props.json');
  writeFileSync(snapshot, JSON.stringify(props));
  const render = spawnSync(process.execPath,
    [path.join(root, 'node_modules/@remotion/cli/remotion-cli.js'), 'render',
      'src/index.ts', templateId, output, `--props=${snapshot}`, ...(process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [])],
    { cwd: root, stdio: 'inherit' });
  if (render.error || render.status !== 0) {
    rmSync(output, { force: true });
    console.error(render.error?.message || 'Render failed; no manifest written.');
    process.exitCode = render.status || 1;
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
if (process.exitCode) process.exit(process.exitCode);

const remotionVersion = require('remotion/package.json').version;
const dims = dimsFor(props.format);
const manifest = {
  schemaVersion: 1,
  template: templateId,
  format: props.format,
  width: dims.width,
  height: dims.height,
  fps: FPS,
  durationInFrames: Math.round(props.durationInSeconds * FPS),
  background: { type: props.background.type, kind: props.background.kind, src: props.background.src || null },
  meta: props.meta,
  inputHash: createHash('sha256').update(JSON.stringify(props)).digest('hex'),
  tools: { remotion: remotionVersion, node: process.version },
  output: outFile,
  generatedAt: new Date().toISOString(),
  note: 'Configuration + brand composition only. A render never implies permission to post. Concept/AI backgrounds must stay labeled as non-gameplay.',
};

const manifestPath = `${outFile}.manifest.json`;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Wrote manifest ${manifestPath}`);
