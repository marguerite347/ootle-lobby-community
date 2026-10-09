import {createHash} from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {validateContests} from '../creator-hub/hub/shared/contestContentValidation.mjs';
import {readContestContent} from '../creator-hub/hub/shared/readContestContent.mjs';
import {monitorContest} from '../scripts/monitor-contest.mjs';
const root=new URL('../',import.meta.url);
const contest={...readContestContent(root)[0],entries:[]};
const entry={slug:'example',title:'Example',summary:'A new confidential game.',creator:'Example creator',sourceUrl:`${contest.threadUrl}/5`,repoUrl:'https://github.com/example/game',publishedAt:'2026-10-03T12:00:00Z',updatedAt:'2026-10-03T12:00:00Z',technologies:[{label:'Template',sourceUrl:'https://github.com/example/game/blob/main/template.rs'}]};
const post={id:101,post_number:5,post_type:1,username:'creator',created_at:entry.publishedAt,updated_at:entry.updatedAt,cooked:'<p>Project with public address text.</p>'};
test('accepts an empty month, then a new shared entry with a credited recording',()=>{
 assert.equal(validateContests([contest])[0].entries.length,0);
 const recording={url:'https://raw.githubusercontent.com/example/reviewed/main/video.mp4',capturedAt:entry.updatedAt,sourceRevision:'commit abc123',kind:'public-page',credit:'Recorded by contributor'};
 assert.equal(validateContests([{...contest,entries:[{...entry,recording}]}])[0].entries.length,1);
});
test('rejects duplicate posts, unsafe media, mismatched months, hidden fields and malformed dates',()=>{
 for(const entries of [[entry,{...entry,slug:'other'}],[{...entry,sourceUrl:'https://community.tari.com/t/september-contest-thread/324/2'}],[{...entry,publishedAt:'yesterday'}],[{...entry,paymentAddress:'not part of the public listing'}],[{...entry,recording:{url:'javascript:alert(1)',capturedAt:entry.updatedAt,sourceRevision:'main',kind:'public-page',credit:'creator'}}]])assert.throws(()=>validateContests([{...contest,entries}]));
});
test('rejects missing, numeric and oversized slugs before remote cards can render',()=>{
 for(const slug of [undefined,123,'a'.repeat(101)])assert.throws(()=>validateContests([{...contest,entries:[{...entry,slug}]}]),/slug/);
});
test('monitor retrieves all posts, ignores moderator actions and emits no raw post body',async()=>{
 const calls=[];
 const read=async url=>{calls.push(url);return calls.length===1?{id:396,post_stream:{stream:[1,2,101],posts:[{id:1,post_number:1,post_type:1},{id:2,post_number:2,post_type:3}]}}:{post_stream:{posts:[post]}};};
 const report=await monitorContest({read,contest});
 assert.equal(calls.length,2);assert.equal(report.observedSubmissionPosts,1);assert.equal(report.candidates[0].review,'new');
 assert.equal(JSON.stringify(report).includes('public address text'),false);
 assert.equal(report.candidates[0].contentSha256.length,64);
});
test('monitor distinguishes edits from unchanged reviewed entries',async()=>{
 const read=async()=>({id:396,post_stream:{stream:[101],posts:[{...post,updated_at:'2026-10-03T13:00:00Z'}]}});
 const report=await monitorContest({read,contest:{...contest,entries:[entry]}});
 assert.equal(report.candidates[0].review,'updated');
 const unchanged=await monitorContest({read:async()=>({id:396,post_stream:{stream:[101],posts:[post]}}),contest:{...contest,entries:[{...entry,sourceContentSha256:createHash('sha256').update(post.cooked).digest('hex')}]}});
 assert.equal(unchanged.candidates[0].review,'listed');
});
test('monitor fails incomplete or unavailable snapshots instead of claiming zero entries',async()=>{
 await assert.rejects(monitorContest({contest,read:async()=>({id:396,post_stream:{stream:[101],posts:[]}})}),/Incomplete/);
 await assert.rejects(monitorContest({contest,read:async()=>{throw new Error('outage');}}),/outage/);
});
