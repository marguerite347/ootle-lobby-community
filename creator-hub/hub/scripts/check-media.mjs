#!/usr/bin/env node
// Check the served catalog, not a checkout that might have different media.
const base = process.argv[2] || 'http://127.0.0.1:4180';
async function json(route) {
  const response = await fetch(new URL(route, base));
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  return response.json();
}
const {items} = await json('/api/resources');
const {collections} = await json('/api/collections');
const resources = new Map(items.map(item => [item.id, item]));
const featured = new Map(collections.flatMap(collection => collection.items).map(item => [item.id, item]));
for (const item of (await json('/api/resources?sort=popular')).items.slice(0, 6)) featured.set(item.id, item);
const failures = [];
const checked = new Set();
for (const item of featured.values()) {
  const detail = await json(`/api/resources/${encodeURIComponent(item.id)}`);
  if (JSON.stringify(item.preview) !== JSON.stringify(resources.get(item.id)?.preview) || JSON.stringify(item.preview) !== JSON.stringify(detail.preview)) failures.push(`${item.id}: inconsistent media across home/search/detail`);
  if (!item.preview?.video) failures.push(`${item.id}: missing featured video`);
  for (const kind of ['image', 'video']) {
    const url = item.preview?.[kind];
    if (!url || !url.startsWith('/previews/') || checked.has(url)) continue;
    checked.add(url);
    const response = await fetch(new URL(url, base), {method: 'HEAD'});
    if (!response.ok || !response.headers.get('content-type')?.startsWith(kind === 'image' ? 'image/' : 'video/') || Number(response.headers.get('content-length')) <= 0) failures.push(`${item.id}: invalid ${kind} response ${url}`);
  }
}
const missing = items.filter(item => !item.preview?.video).map(item => ({id:item.id, title:item.title, source:item.sourceUrl}));
console.log(JSON.stringify({base, total:items.length, videos:items.length - missing.length, featured:featured.size, failures, missing}, null, 2));
if (failures.length || (process.argv.includes('--all') && missing.length)) process.exitCode = 1;
