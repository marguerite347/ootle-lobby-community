import {expect,it} from 'vitest';
import {contestOpen,validatePublicProjectUrl,contestEntryText,validateContestSocialUrl} from './monthlyContest';
it('closes the verified edition at the UTC deadline without inventing a next edition',()=>{
 expect(contestOpen(new Date('2026-10-31T23:59:59Z'))).toBe(true);
 expect(contestOpen(new Date('2026-11-01T00:00:00Z'))).toBe(false);
 expect(contestOpen(new Date('2026-09-30T23:59:59Z'))).toBe(false);
});
it('rejects local preview links and retains all four required entry fields',()=>{
 for(const url of ['http://localhost:4189/','http://127.0.0.1/','http://192.168.1.1/','javascript:alert(1)'])expect(validatePublicProjectUrl(url)).toBe(false);
 expect(validatePublicProjectUrl('https://github.com/creator/project')).toBe(true);
 const entry={title:'Game',projectUrl:'https://example.com',description:'An Ootle game',address:'PUBLIC-ADDRESS',socialUrl:'https://example.com/post'};
 const prepared=contestEntryText(entry);
 for(const value of Object.values(entry))expect(prepared).toContain(value);
});

it('accepts public announcements across social platforms',()=>{
 expect(validateContestSocialUrl('https://bsky.app/profile/creator.test/post/abc123')).toBe(true);
 expect(validateContestSocialUrl('https://www.reddit.com/r/tari/comments/abc123/my_build/')).toBe(true);
 for(const url of ['https://x.com/creator/status/123','https://twitter.com/creator/status/456','https://mastodon.social/@creator/123','https://www.linkedin.com/posts/creator_game','https://www.youtube.com/watch?v=demo']) expect(validateContestSocialUrl(url)).toBe(true);
 for(const url of ['https://x.com/creator','https://bsky.app/','https://reddit.com.evil.test/comments/abc123','https://www.reddit.com/r/tari/','http://localhost/post','javascript:alert(1)','https://user:password@social.example/post']) expect(validateContestSocialUrl(url)).toBe(false);
});
