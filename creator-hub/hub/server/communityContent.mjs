import {readContestContent} from '../shared/readContestContent.mjs';
import {readFileSync} from 'node:fs';
import {validateFeed} from '../shared/communityContentValidation.mjs';
import {getJson} from './connectors/http.mjs';
import {contestRegistry} from './contestEntries.mjs';

export const CONTENT_REPOSITORY = 'https://github.com/marguerite347/ootle-lobby-community';
export const CONTENT_FEED = 'https://marguerite347.github.io/ootle-lobby-community/content.json';
const seed = JSON.parse(readFileSync(new URL('../data/contests/community-content.json', import.meta.url), 'utf8'));
const bundledContests = readContestContent(new URL('../../../', import.meta.url));
const expectedIds = new Set(contestRegistry.entries.map(entry => entry.id));
export function acceptedContent(feed) {
  validateFeed(feed);
  if (feed.projects.length !== expectedIds.size || feed.projects.some(project => !expectedIds.has(project.id))) throw new Error('Content does not match the September project registry.');
  return feed;
}

export function createCommunityContent({initial = seed, read = getJson, now = Date.now} = {}) {
  let snapshot = acceptedContent(initial);
  let nextRefresh = 0;
  let pending;
  let checkedAt = null;
  let cached = true;
  return async () => {
    if (now() >= nextRefresh && !pending) {
      pending = read(CONTENT_FEED, {timeoutMs: 5000}).then(feed => {
        snapshot = acceptedContent(feed);
        checkedAt = new Date(now()).toISOString();
        cached = false;
      }).catch(() => { cached = true; })
        .finally(() => { nextRefresh = now() + 60000; pending = undefined; });
    }
    if (pending) await pending;
    return {...snapshot, contests:snapshot.contests || bundledContests, repositoryUrl: CONTENT_REPOSITORY, checkedAt, cached};
  };
}
