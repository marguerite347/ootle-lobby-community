// GitHub signal enrichment: attach real stars/forks/watchers/last-push to records
// that point at a GitHub repository. Deduplicated by repo, capped, and token-aware
// (set GITHUB_TOKEN/GH_TOKEN to raise the rate limit). Failures are tolerated —
// a record simply keeps no GitHub signal rather than a fabricated one.

import { getJson, githubHeaders } from '../connectors/http.mjs';

function repoKey(url) {
  const m = url && url.match(/github\.com\/([^/#?]+)\/([^/#?]+)/i);
  if (!m) return null;
  return `${m[1]}/${m[2].replace(/\.git$/, '')}`;
}

export async function enrichGithub(records, { cap = 40 } = {}) {
  const byRepo = new Map();
  for (const r of records) {
    const key = repoKey(r.repoUrl || r.sourceUrl || '');
    if (!key) continue;
    if (!byRepo.has(key)) byRepo.set(key, []);
    byRepo.get(key).push(r);
  }
  const keys = [...byRepo.keys()].slice(0, cap);
  let fetched = 0; let failed = 0;
  for (const key of keys) {
    try {
      const d = await getJson(`https://api.github.com/repos/${key}`, { headers: githubHeaders(), timeoutMs: 12000 });
      const sig = {
        repo: key,
        stars: d.stargazers_count ?? null,
        forks: d.forks_count ?? null,
        watchers: d.subscribers_count ?? null,
        openIssues: d.open_issues_count ?? null,
        pushedAt: d.pushed_at ?? null,
      };
      for (const r of byRepo.get(key)) r.signals = { ...r.signals, github: sig };
      fetched++;
    } catch {
      failed++;
    }
  }
  return { repos: keys.length, fetched, failed };
}
