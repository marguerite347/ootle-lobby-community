// GDevelop examples & templates (external no-code engine; examples may be 2D or 3D).
// Source: https://github.com/GDevelopApp/GDevelop-examples (examples/ folder).
// These are general GDevelop resources, labeled distinctly from tested Tari/Ootle
// integrations (CREATOR_HUB.md). Tari compatibility is unknown (null), not implied.

import { getJson, githubHeaders, slug } from './http.mjs';
import { makeResource } from '../model.mjs';
import { gdevelopStarterDimension, tagsWithDimension } from '../../shared/starterShelf.mjs';

const REPO = 'GDevelopApp/GDevelop-examples';
const REPO_URL = `https://github.com/${REPO}`;
const LIMIT = 24;

export const source = {
  id: 'gdevelop-examples',
  name: 'GDevelop examples & templates',
  kind: 'github',
  canonicalUrl: REPO_URL,
  ingestion: 'GitHub contents API over examples/ (capped)',
  native: false,
};

export async function fetchLive() {
  let dirs = [];
  try {
    const items = await getJson(`https://api.github.com/repos/${REPO}/contents/examples`, {
      headers: githubHeaders(),
      timeoutMs: 15000,
    });
    dirs = (Array.isArray(items) ? items : []).filter((i) => i.type === 'dir').slice(0, LIMIT);
  } catch (e) {
    throw new Error(`GDevelop listing failed: ${e.message}`);
  }
  const records = dirs.map((d) => {
    const name = d.name.replace(/[_-]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
    const starterDimension = gdevelopStarterDimension({ title: name, id: `gdevelop:starter:${slug(d.name)}`, provenance: { upstreamId: d.name } });
    return makeResource({
      id: `gdevelop:starter:${slug(d.name)}`,
      type: 'starter',
      ecosystem: 'gdevelop',
      title: name,
      summary: `GDevelop example project "${name}". Open in the GDevelop editor as a starting point or reference.`,
      sourceUrl: `${REPO_URL}/tree/master/examples/${d.name}`,
      repoUrl: REPO_URL,
      docsUrl: 'https://wiki.gdevelop.io/',
      demoUrl: `https://editor.gdevelop.io/?project=example://${d.name}`,
      readiness: 'runnable-example',
      license: 'MIT (GDevelop-examples repository)',
      prerequisites: ['GDevelop editor'],
      tags: tagsWithDimension(['gdevelop', 'no-code', 'game', 'example'], starterDimension),
      creator: { name: 'GDevelopApp', url: 'https://github.com/GDevelopApp' },
      attribution: 'GDevelop examples repository (GDevelopApp)',
      sourceId: source.id,
      sourceName: source.name,
      upstreamId: d.name,
      upstreamRevision: d.sha,
      freshness: 'current',
      verification: 'source-attested',
      tariCompatible: null,
      setupHint: 'Open in GDevelop editor (https://editor.gdevelop.io) or clone the examples repo.',
    });
  });
  return { records };
}
