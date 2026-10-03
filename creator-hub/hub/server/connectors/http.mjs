// Small fetch helpers shared by connectors: timeouts, JSON, and light HTML-to-text.

const UA = 'ootle-lobby-ingest/0.1 (+https://github.com/marguerite347/ootle-lobby)';

export async function getJson(url, { timeoutMs = 15000, headers = {} } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, Accept: 'application/json', ...headers },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Optional GitHub auth raises the unauthenticated rate limit when a token is present.
// Accepts the conventional names plus `Github` (the secret name configured for this
// environment), so a token added under any of them is used without renaming.
export function githubHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_PAT || process.env.Github;
  const h = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&nbsp;': ' ', '&hellip;': '…', '&mdash;': '—', '&ndash;': '–',
};

export function htmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>(?=)/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m] ?? m)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function firstUrl(text, pattern) {
  const re = pattern || /https?:\/\/[^\s"'<>)\]]+/i;
  const m = text.match(re);
  return m ? m[0].replace(/[.,)]+$/, '') : null;
}

export function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}
