// Ootle Testnet — Community Apps Directory (the "apps directory thread").
// Source: Tari Community Discourse, read via its public .json topic API.
// https://community.tari.com/t/ootle-testnet-community-apps-directory/281
//
// The opening post carries a clean ordered "Quick Navigation" list (name + link +
// category) plus per-app <h3> detail sections. Replies add apps with a labeled
// template (Project/Category/Website/GitHub/Short description/Testnet status).
// We parse both. Entries are community-attested testnet apps: readiness
// "runnable-example" on Ootle testnet, never presented as production-ready.

import { getJson, htmlToText, firstUrl, slug } from './http.mjs';
import { makeResource } from '../model.mjs';

const TOPIC_URL = 'https://community.tari.com/t/ootle-testnet-community-apps-directory/281';
const JSON_URL = `${TOPIC_URL}.json`;
const GITHUB_RE = /https?:\/\/github\.com\/[^\s"'<>)\]]+/i;

export const source = {
  id: 'ootle-apps-directory',
  name: 'Ootle Testnet — Community Apps Directory',
  kind: 'discourse',
  canonicalUrl: TOPIC_URL,
  ingestion: 'Complete Discourse post stream; directory sections, structured replies and reviewed narrative submissions',
  native: true,
};

function cleanSummary(text) {
  if (!text) return null;
  return text
    .replace(/Category\s*[:\-].*(\n|$)/i, '')
    .replace(/\bimage\s*\d+[×x]\d+[^\n]*?KB/gi, '')
    .replace(/Powered by\s*[:\-].*/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 400) || null;
}

function validName(name) {
  if (!name) return false;
  const n = name.trim();
  if (n.length < 2 || n.length > 48) return false;
  if (/[?]/.test(n)) return false;
  if (/\.$/.test(n)) return false;
  if (n.split(/\s+/).length > 7) return false;
  if (/^(category|website|github|short description|testnet status|donate|status|note|disclaimer)\b/i.test(n)) return false;
  return true;
}

// Parse the opening post's nav <ol> and per-app <h3> sections.
function parseOpApps(cooked) {
  const apps = new Map(); // key: lowercased name
  const put = (name, patch) => {
    if (!validName(name)) return;
    const key = name.toLowerCase();
    const cur = apps.get(key) || { title: name.trim(), website: null, repo: null, category: null, summary: null };
    apps.set(key, {
      title: cur.title,
      website: cur.website || patch.website || null,
      repo: cur.repo || patch.repo || null,
      category: cur.category || patch.category || null,
      summary: cur.summary || patch.summary || null,
    });
  };

  // 1. Quick Navigation ordered list: <li><a href="URL">Name</a> — Category</li>
  const liRe = /<li>\s*<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>\s*(?:—|–|-)?\s*([^<]*)<\/li>/gi;
  let m;
  while ((m = liRe.exec(cooked))) {
    const website = m[1];
    const name = htmlToText(m[2]).trim();
    const category = htmlToText(m[3]).trim() || null;
    if (!/community\.tari\.com/i.test(website)) put(name, { website, category });
  }

  // 2. Per-app <h3> detail sections.
  const sections = cooked.split(/<h3[^>]*>/i).slice(1);
  for (const sec of sections) {
    const headEnd = sec.indexOf('</h3>');
    if (headEnd < 0) continue;
    const headHtml = sec.slice(0, headEnd).replace(/<a[^>]*>.*?<\/a>/gi, '').replace(/<img[^>]*>/gi, '');
    const name = htmlToText(headHtml).replace(/^\d+\.?\s*/, '').trim();
    const bodyHtml = sec.slice(headEnd + 5).split(/<h[23][^>]*>/i)[0];
    const text = htmlToText(bodyHtml);
    const repo = firstUrl(bodyHtml.replace(/&quot;/g, '"'), GITHUB_RE);
    const website = firstUrl(text.replace(/https?:\/\/community\.tari\.com\S*/gi, ''));
    const category = (text.match(/Category\s*[:\-]\s*(.+)/i) || [])[1]?.split('\n')[0]?.trim() || null;
    put(name, { website, repo, category, summary: cleanSummary(text) });
  }
  return Array.from(apps.values());
}

function parseReply(text) {
  const grab = (label) => {
    const re = new RegExp(`${label}\\s*[:\\-]\\s*(.+)`, 'i');
    const mm = text.match(re);
    return mm ? mm[1].split('\n')[0].trim() : null;
  };
  const project = grab('Project');
  if (!validName(project)) return null;
  const website = firstUrl(grab('Website') || '');
  const repo = firstUrl(grab('GitHub') || '', GITHUB_RE);
  if (!website && !repo) return null;
  return { title: project, category: grab('Category'), website, repo, summary: cleanSummary(grab('Short description')) };
}

// Narrative submissions do not follow the directory form. These reviewed mappings
// only apply while their source post still contains the declared URL. Unknown prose
// is not guessed into a project; keep reviewing new formats as the thread grows.
const NARRATIVE = {
  1454: [{ title: 'ShadowTix', website: 'https://shadowtix.shop', category: 'Event ticketing', summary: 'Community-reported testnet event ticketing, refunds, check-in and resale. See the source thread for limitations and later technical corrections.' }],
  1455: [{ title: 'Tari Agent Pay', repo: 'https://github.com/zvovanz-a1/tari-agent-pay', category: 'Agent payments', summary: 'Community-shared source repository for agent payments; deployment and runtime behavior have not been verified.', readiness: 'conceptual' }],
};

function linkedText(html) {
  return htmlToText(html.replace(/<a\b[^>]*href="(https?:[^"<>]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, url, label) => `${url} ${htmlToText(label)}`));
}

function canonical(url) {
  try { const u = new URL(url); return (u.hostname.toLowerCase() + u.pathname).replace(/\/$/, ''); }
  catch { return null; }
}

export async function fetchPosts(read = getJson) {
  const data = await read(JSON_URL, { timeoutMs: 20000 });
  const stream = data?.post_stream;
  if (!Array.isArray(stream?.posts) || !Array.isArray(stream?.stream)) throw new Error('Incomplete Discourse post stream');
  const posts = new Map(stream.posts.map(p => [p.id, p]));
  const missing = stream.stream.filter(id => !posts.has(id));
  for (let i = 0; i < missing.length; i += 20) {
    const query = missing.slice(i, i + 20).map(id => `post_ids[]=${encodeURIComponent(id)}`).join('&');
    const batch = await read(`https://community.tari.com/t/281/posts.json?${query}`, { timeoutMs: 20000 });
    for (const p of batch?.post_stream?.posts || []) posts.set(p.id, p);
  }
  if (stream.stream.some(id => !posts.has(id))) throw new Error('Discourse response omitted requested posts');
  return stream.stream.map(id => posts.get(id)).sort((a, b) => a.post_number - b.post_number);
}

export async function fetchLive({ read = getJson } = {}) {
  const posts = await fetchPosts(read);
  const found = new Map();

  const add = (entry, post) => {
    if (!entry || !validName(entry.title)) return;
    const previous = [...found.values()].find(r =>
      canonical(r.sourceUrl) && canonical(r.sourceUrl) === canonical(entry.website || entry.repo));
    const id = previous?.id || `tari-ootle:app:${slug(entry.title)}`;
    if (found.has(id)) {
      const r = found.get(id);
      r.summary = entry.summary || r.summary;
      r.repoUrl = entry.repo || r.repoUrl;
      if (entry.summary || entry.repo) {
        r.docsUrl = `${TOPIC_URL}/${post.post_number}`;
        r.provenance.upstreamId = `post:${post.id}`;
        r.provenance.upstreamRevision = post.updated_at || post.created_at || null;
        r.provenance.sourceUpdatedAt = post.updated_at || post.created_at || null;
      }
      return;
    }
    const website = entry.website || entry.repo || null;
    const cats = entry.category ? entry.category.split(/[\/,]/).map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
    found.set(id, makeResource({
      id,
      type: 'app',
      ecosystem: 'tari-ootle',
      title: entry.title.trim(),
      summary: entry.summary || null,
      category: entry.category || null,
      sourceUrl: website,
      demoUrl: entry.website || null,
      repoUrl: entry.repo || null,
      docsUrl: `${TOPIC_URL}/${post.post_number || 1}`,
      network: 'Ootle testnet',
      readiness: entry.readiness || 'runnable-example',
      tags: ['ootle', 'testnet', 'community-app', ...cats].slice(0, 8),
      creator: post.username ? { name: post.username, url: `https://community.tari.com/u/${post.username}` } : null,
      attribution: post.username ? `Listed in the Ootle Community Apps Directory (via @${post.username})` : 'Ootle Community Apps Directory',
      sourceId: source.id,
      sourceName: source.name,
      upstreamId: `post:${post.id}`,
      upstreamRevision: post.updated_at || post.created_at || null,
      sourceUpdatedAt: post.updated_at || post.created_at || null,
      freshness: 'current',
      verification: 'source-attested',
      tariCompatible: true,
      signals: (post.reads != null || post.score != null)
        ? { discourse: { reads: post.reads ?? null, readers: post.readers_count ?? null, score: post.score ?? null } }
        : {},
    }));
  };

  posts.forEach((post) => {
    const html = post.cooked || '';
    // Directory-style headings appear in later replies as well as the opening post.
    if (post.post_number === 1 || /Category\s*(?:<[^>]*>)*\s*:/i.test(html)) {
      for (const e of parseOpApps(html)) if (e.website || e.repo) add(e, post);
    }
    const e = parseReply(linkedText(html));
    if (e) add(e, post);
    for (const entry of NARRATIVE[post.id] || []) {
      if (html.includes(entry.website || entry.repo)) add(entry, post);
    }
  });
  return { records: Array.from(found.values()) };
}
