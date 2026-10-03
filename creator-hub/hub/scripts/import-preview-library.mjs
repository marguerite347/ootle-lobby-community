#!/usr/bin/env node
// Reuse a reviewed runtime library without importing retired/unreviewed covers.
import {realpathSync, readFileSync, existsSync, mkdirSync, writeFileSync, renameSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {approvedGeneratedPreview} from '../server/preview-policy.mjs';
import {previewsDir} from '../server/paths.mjs';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const key = entry => entry.id || entry.url || entry.slug;
function readMedia(directory, url) {
  if (typeof url !== 'string' || !/^\/previews\/[a-z0-9-]+\.(mp4|poster\.png)$/.test(url)) return null;
  const file = path.join(directory, path.basename(url));
  return existsSync(file) ? readFileSync(file) : null;
}
function publishMedia(directory, bytes, extension) {
  const name = `media-${digest(bytes)}.${extension}`;
  const file = path.join(directory, name);
  if (!existsSync(file)) {
    writeFileSync(file + '.tmp', bytes);
    renameSync(file + '.tmp', file);
  } else if (digest(readFileSync(file)) !== digest(bytes)) {
    throw new Error(`Corrupt immutable media: ${name}`);
  }
  return `/previews/${name}`;
}
export function importPreviewLibrary(source, destination) {
  if (path.resolve(source) === path.resolve(destination)) throw new Error('Choose a different source and destination');
  const entries = ['catalog-index.json', 'index.json'].flatMap(name => {
    const file = path.join(source, name);
    if (!existsSync(file)) return [];
    const data = JSON.parse(readFileSync(file, 'utf8'));
    if (!Array.isArray(data)) throw new Error(`Invalid index: ${file}`);
    return data;
  });
  if (!entries.length) throw new Error('No preview entries found in source library');
  mkdirSync(destination, {recursive: true});
  const index = path.join(destination, 'catalog-index.json');
  const merged = new Map((existsSync(index) ? JSON.parse(readFileSync(index, 'utf8')) : []).map(entry => [key(entry), entry]));
  let imported = 0;
  const skipped = [];
  for (const entry of entries) {
    const video = readMedia(source, entry.video);
    const approved = entry.source === 'capture' || (approvedGeneratedPreview(entry) && video && digest(video) === entry.review.videoSha256);
    if (!key(entry) || !video || !approved) { skipped.push(key(entry) || entry.name || 'unknown'); continue; }
    const image = readMedia(source, entry.image);
    merged.set(key(entry), {...entry, video: publishMedia(destination, video, 'mp4'), image: image ? publishMedia(destination, image, 'poster.png') : null});
    imported++;
  }
  writeFileSync(index + '.tmp', JSON.stringify([...merged.values()], null, 2) + '\n');
  renameSync(index + '.tmp', index);
  return {imported, skipped, destination};
}
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const source = process.argv[2];
  if (!source) throw new Error('Usage: npm run media:import -- /path/to/existing/previews');
  console.log(JSON.stringify(importPreviewLibrary(source, previewsDir), null, 2));
}
