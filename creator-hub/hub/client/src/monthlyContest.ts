import {OCTOBER_CONTESTS} from './seasonalContests';

export const MONTHLY_CONTEST = {
  title: 'October 2026: Spooky Secrets',
  opensAt: OCTOBER_CONTESTS.opensAt,
  closesAt: OCTOBER_CONTESTS.closesAt,
  checkedAt: OCTOBER_CONTESTS.checkedAt,
  rulesUrl: OCTOBER_CONTESTS.buildRules,
  entryUrl: OCTOBER_CONTESTS.buildThread,
};
export function contestOpen(now = new Date()) {
  return now.getTime() >= Date.parse(MONTHLY_CONTEST.opensAt) && now.getTime() < Date.parse(MONTHLY_CONTEST.closesAt);
}
export function validatePublicProjectUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password &&
      !['localhost', '[::1]', '0.0.0.0'].includes(host) && !host.endsWith('.localhost') &&
      !host.endsWith('.test') && !host.endsWith('.invalid') && !host.endsWith('.local') && !/^127\.|^10\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[01])\./.test(host);
  } catch { return false; }
}
export type ContestEntry = {title: string; projectUrl: string; description: string; address: string; socialUrl: string};
export function contestEntryText(entry: ContestEntry) {
  return `Project: ${entry.title.trim()}\n\nCode / app: ${entry.projectUrl.trim()}\n\nDescription:\n${entry.description.trim()}\n\nTari payment address: ${entry.address.trim()}\n\nPublic social announcement: ${entry.socialUrl.trim()}`;
}

export function validateContestSocialUrl(value: string) {
  if (!validatePublicProjectUrl(value)) return false;
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  if (host === 'bsky.app') return /^\/profile\/[^/]+\/post\/[^/]+/.test(url.pathname);
  if (host === 'reddit.com' || host.endsWith('.reddit.com')) return /\/comments\/[^/]+/.test(url.pathname);
  if (['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'].includes(host)) return /\/status\/\d+/.test(url.pathname);
  return url.pathname.replace(/\//g, '').length > 0;
}
