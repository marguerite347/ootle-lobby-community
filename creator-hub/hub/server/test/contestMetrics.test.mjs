import test from 'node:test';
import assert from 'node:assert/strict';
import {githubRepository, submissionDates, submissionComments, fetchContestPosts, refreshContestMetrics, createContestMetrics} from '../contestMetrics.mjs';
import {contestRegistry} from '../contestEntries.mjs';

test('repository subdirectory links share the real GitHub repository count', () => {
  assert.equal(githubRepository('https://github.com/Seal-Clubber/Threshold/tree/main/crates/threshold-bounty-template'), 'Seal-Clubber/Threshold');
  assert.equal(githubRepository('https://git.disroot.org/comiama/wunschswap'), null);
  assert.equal(githubRepository('https://github.com.evil.example/a/b'), null);
});

test('forum counts include nested comments but exclude other projects and the submission itself', () => {
  const posts = [
    {post_number: 2}, {post_number: 3},
    {post_number: 4, reply_to_post_number: 2},
    {post_number: 5, reply_to_post_number: 4},
    {post_number: 6, reply_to_post_number: 3},
    {post_number: 7, reply_to_post_number: 8},
    {post_number: 8, reply_to_post_number: 7},
  ];
  assert.equal(submissionComments(posts, 2), 2);
  assert.equal(submissionComments(posts, 3), 1);
  assert.equal(submissionComments(posts, 6), 0);
  assert.equal(submissionComments(posts, 99), null);
});

test('forum pagination must finish before any counts are accepted', async () => {
  const first = {post_stream: {stream: [1, 2], posts: [{id: 1, post_number: 1}]}};
  const read = async url => url.includes('posts.json')
    ? {post_stream: {posts: [{id: 2, post_number: 2, reply_to_post_number: 1}]}} : first;
  assert.equal((await fetchContestPosts(read)).length, 2);
  await assert.rejects(fetchContestPosts(async () => first), /omitted/);
});

test('refresh deduplicates repositories, preserves unavailable counts and accepts genuine zero', async () => {
  const id = 'tari-ootle:app:tariorg';
  const previous = {items: {[id]: {github: {count: 7, checkedAt: '2026-10-01'}, forum: {count: 4, checkedAt: '2026-10-01'}}}};
  const calls = [];
  const result = await refreshContestMetrics(previous, async url => {
    calls.push(url);
    if (url.includes('community.tari.com') || url.endsWith('n0izn0iz/tariorg')) throw new Error('Unavailable');
    return {stargazers_count: 0};
  });
  assert.equal(calls.filter(url => url.endsWith('/Seal-Clubber/Threshold')).length, 1);
  assert.equal(result.items[id].github.count, 7);
  assert.equal(result.items[id].github.checkedAt, '2026-10-01');
  assert.equal(result.items[id].forum.count, 4);
  assert.equal(result.items['tari-ootle:app:ootle-pay'].github.count, 0);
  assert.equal(result.items['tari-ootle:app:ootle-pay'].forum.count, null);
  assert.equal(result.items['tari-ootle:app:wunschswap'].github, null);
  assert.equal(Object.keys(result.items).length, contestRegistry.entries.length);
});

test('concurrent requests reuse one refresh and then the cached snapshot', async () => {
  let calls = 0;
  const snapshot = {checkedAt: '2026-10-03', items: {}};
  const read = createContestMetrics({initial: {items: {}}, now: () => 1,
    refresh: async () => { calls++; return snapshot; }});
  assert.deepEqual(await Promise.all([read(), read()]), [snapshot, snapshot]);
  assert.equal(await read(), snapshot);
  assert.equal(calls, 1);
});


test('publication stays at the original post date; curated creator updates exclude visitor replies', () => {
  const entry = {postNumber: 2, updates: [{postNumber: 4}]};
  const dates = submissionDates([
    {post_number: 2, created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-02T00:00:00Z'},
    {post_number: 4, created_at: '2026-09-10T00:00:00Z', updated_at: '2026-09-11T00:00:00Z'},
    {post_number: 5, created_at: '2026-10-01T00:00:00Z', reply_to_post_number: 2},
  ], entry);
  assert.equal(dates.publishedAt, '2026-09-01T00:00:00Z');
  assert.equal(dates.updatedAt, '2026-09-11T00:00:00Z');
  assert.ok(dates.updateUrl.endsWith('/4'));
});

test('GitHub push dates preserve last-good activity during source failures', async () => {
  const id = 'tari-ootle:app:tariorg';
  const snapshot = await refreshContestMetrics({items: {}}, async url => {
    if (url.includes('community.tari.com')) throw new Error('Unavailable');
    return {stargazers_count: 2, pushed_at: '2026-10-02T03:00:00Z'};
  });
  assert.equal(snapshot.items[id].github.pushedAt, '2026-10-02T03:00:00Z');
  const fallback = await refreshContestMetrics(snapshot, async () => {throw new Error('Unavailable');});
  assert.deepEqual(fallback.items[id], snapshot.items[id]);
  assert.equal(fallback.items['tari-ootle:app:wunschswap'].github, null);
});
