import {readFileSync} from 'node:fs';
import {contestRegistry} from './contestEntries.mjs';
import {getJson, githubHeaders} from './connectors/http.mjs';

const FORUM = 'https://community.tari.com';
const REFRESH_MS = 6 * 60 * 60 * 1000;
const seed = JSON.parse(readFileSync(new URL('../data/contests/september-2026-metrics.json', import.meta.url), 'utf8'));

export function githubRepository(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;
    const [owner, name] = parsed.pathname.split('/').filter(Boolean);
    return owner && name ? `${owner}/${name.replace(/\.git$/, '')}` : null;
  } catch { return null; }
}

// Follow the complete Discourse stream, as the existing apps connector does.
export async function fetchContestPosts(read = getJson, topicId = contestRegistry.topicId) {
  const topic = await read(`${FORUM}/t/${topicId}.json`, {timeoutMs: 10000});
  const stream = topic?.post_stream;
  if (!Array.isArray(stream?.posts) || !Array.isArray(stream?.stream)) throw new Error('Incomplete forum stream');
  const posts = new Map(stream.posts.map(post => [post.id, post]));
  const missing = stream.stream.filter(id => !posts.has(id));
  for (let offset = 0; offset < missing.length; offset += 20) {
    const query = missing.slice(offset, offset + 20).map(id => `post_ids[]=${encodeURIComponent(id)}`).join('&');
    const batch = await read(`${FORUM}/t/${topicId}/posts.json?${query}`, {timeoutMs: 10000});
    for (const post of batch?.post_stream?.posts || []) posts.set(post.id, post);
  }
  if (stream.stream.some(id => !posts.has(id))) throw new Error('Forum omitted requested posts');
  return stream.stream.map(id => posts.get(id));
}

// Count comments in this submission's reply tree, including nested replies.
// Other project submissions in the shared contest topic are not comments here.
export function submissionComments(posts, postNumber) {
  const byNumber = new Map(posts.map(post => [post.post_number, post]));
  if (!byNumber.has(postNumber)) return null;
  return posts.filter(post => {
    const seen = new Set([post.post_number]);
    let parent = post.reply_to_post_number;
    while (parent && !seen.has(parent)) {
      if (parent === postNumber) return true;
      seen.add(parent);
      parent = byNumber.get(parent)?.reply_to_post_number;
    }
    return false;
  }).length;
}

function sourceDate(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;
}

// Only the submission and its curated creator updates count as project updates.
// A visitor's comment should not make the project look newly published or updated.
export function submissionDates(posts, entry) {
  const submission = posts.find(post => post.post_number === entry.postNumber);
  const updateNumbers = new Set([entry.postNumber, ...(entry.updates || []).map(update => update.postNumber)]);
  const updates = posts.filter(post => updateNumbers.has(post.post_number))
    .map(post => ({at: sourceDate(post.updated_at) || sourceDate(post.created_at), number: post.post_number}))
    .filter(post => post.at)
    .sort((first, second) => Date.parse(second.at) - Date.parse(first.at));
  return {
    publishedAt: sourceDate(submission?.created_at),
    updatedAt: updates[0]?.at || null,
    updateUrl: updates[0] ? `${FORUM}/t/${contestRegistry.topicId}/${updates[0].number}` : null,
  };
}

export async function refreshContestMetrics(previous = seed, read = getJson, now = Date.now()) {
  const checkedAt = new Date(now).toISOString();
  const repos = [...new Set(contestRegistry.entries.map(entry => githubRepository(entry.repoUrl)).filter(Boolean))];
  const [forum, ...github] = await Promise.allSettled([
    fetchContestPosts(read),
    ...repos.map(async repo => {
      const response = await read(`https://api.github.com/repos/${repo}`, {headers: githubHeaders(), timeoutMs: 10000});
      if (!Number.isInteger(response.stargazers_count) || response.stargazers_count < 0) throw new Error('Missing GitHub star count');
      return {count: response.stargazers_count, pushedAt: sourceDate(response.pushed_at)};
    }),
  ]);
  const stars = new Map(repos.map((repo, index) => [repo, github[index]]));
  const items = Object.fromEntries(contestRegistry.entries.map(entry => {
    const repo = githubRepository(entry.repoUrl);
    const result = stars.get(repo);
    const prior = previous.items?.[entry.id];
    const comments = forum.status === 'fulfilled' ? submissionComments(forum.value, entry.postNumber) : null;
    const dates = forum.status === 'fulfilled' ? submissionDates(forum.value, entry) : null;
    return [entry.id, {
      github: repo ? {
        count: result?.status === 'fulfilled' ? result.value.count : prior?.github?.count ?? null,
        url: `https://github.com/${repo}/stargazers`,
        pushedAt: result?.status === 'fulfilled' ? result.value.pushedAt ?? prior?.github?.pushedAt ?? null : prior?.github?.pushedAt ?? null,
        activityUrl: `https://github.com/${repo}/activity`,
        checkedAt: result?.status === 'fulfilled' ? checkedAt : prior?.github?.checkedAt ?? null,
      } : null,
      forum: {
        count: comments ?? prior?.forum?.count ?? null,
        url: entry.sourceUrl,
        publishedAt: dates?.publishedAt ?? prior?.forum?.publishedAt ?? entry.publishedAt ?? null,
        updatedAt: dates?.updatedAt ?? prior?.forum?.updatedAt ?? entry.updatedAt ?? null,
        updateUrl: dates?.updateUrl ?? prior?.forum?.updateUrl ?? entry.sourceUrl,
        checkedAt: comments !== null ? checkedAt : prior?.forum?.checkedAt ?? null,
      },
    }];
  }));
  return {checkedAt, items};
}

export function createContestMetrics({initial = seed, refresh = refreshContestMetrics, now = Date.now} = {}) {
  let snapshot = initial;
  let nextRefresh = Date.parse(initial.checkedAt || '') + REFRESH_MS || 0;
  let pending;
  return async () => {
    if (now() < nextRefresh) return snapshot;
    if (!pending) {
      pending = refresh(snapshot).then(result => { snapshot = result; return result; })
        .catch(() => snapshot)
        .finally(() => { nextRefresh = now() + REFRESH_MS; pending = undefined; });
    }
    return pending;
  };
}
