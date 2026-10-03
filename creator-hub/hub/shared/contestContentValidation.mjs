export const OCTOBER_THREAD = 'https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396';
function plain(value, name, max = 1500) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[<>\u0000-\u001f]/.test(value)) throw new Error(`Invalid ${name}.`);
}
function fields(value, allowed) {
  if (!value || Array.isArray(value) || typeof value !== 'object' || Object.keys(value).some(k => !allowed.includes(k))) throw new Error('Unsupported contest content fields.');
}
function https(value) {
  plain(value, 'URL');const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Expected public HTTPS URL without credentials.');
}
function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error('Invalid timestamp.');
}
export function validateContests(contests) {
  if (!Array.isArray(contests) || contests.length !== 1) throw new Error('Expected the October contest registry.');
  const contest = contests[0];
  fields(contest, ['id','title','threadUrl','checkedAt','observedSubmissionPosts','entries']);
  if (contest.id !== 'october-2026' || contest.threadUrl !== OCTOBER_THREAD) throw new Error('Unexpected contest identity.');
  plain(contest.title,'contest title',100);date(contest.checkedAt);
  if (!Number.isInteger(contest.observedSubmissionPosts) || contest.observedSubmissionPosts < 0) throw new Error('Invalid observation count.');
  if (!Array.isArray(contest.entries) || contest.entries.length > 100) throw new Error('Expected up to 100 reviewed entries.');
  const slugs=new Set(),posts=new Set();
  for (const entry of contest.entries) {
    fields(entry,['slug','title','summary','creator','sourceUrl','repoUrl','demoUrl','publishedAt','updatedAt','technologies','recording']);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) || slugs.has(entry.slug)) throw new Error('Invalid or duplicate submission slug.');
    slugs.add(entry.slug);plain(entry.title,'entry title',100);plain(entry.summary,'summary');plain(entry.creator,'creator',80);
    https(entry.sourceUrl);
    if (!entry.sourceUrl.startsWith(`${OCTOBER_THREAD}/`) || !/^[2-9]\d*$|^1\d+$/.test(entry.sourceUrl.slice(OCTOBER_THREAD.length+1)) || posts.has(entry.sourceUrl)) throw new Error('Expected a unique October submission post.');
    posts.add(entry.sourceUrl);https(entry.repoUrl);if(entry.demoUrl)https(entry.demoUrl);
    date(entry.publishedAt);date(entry.updatedAt);
    if (Date.parse(entry.updatedAt)<Date.parse(entry.publishedAt)) throw new Error('Update precedes submission.');
    if(!Array.isArray(entry.technologies)||entry.technologies.length>6)throw new Error('Expected up to six evidenced technology labels.');
    for(const item of entry.technologies){fields(item,['label','sourceUrl']);plain(item.label,'technology',60);https(item.sourceUrl);}
    if(entry.recording){
      fields(entry.recording,['url','posterUrl','capturedAt','sourceRevision','kind','credit']);
      https(entry.recording.url);if(entry.recording.posterUrl)https(entry.recording.posterUrl);date(entry.recording.capturedAt);
      plain(entry.recording.sourceRevision,'source revision',120);plain(entry.recording.credit,'recording credit',200);
      if(!['public-page','walkthrough','gameplay'].includes(entry.recording.kind))throw new Error('Unknown recording kind.');
    }
  }
  return contests;
}
