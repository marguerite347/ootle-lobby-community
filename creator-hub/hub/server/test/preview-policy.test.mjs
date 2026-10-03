import {test} from 'node:test';
import assert from 'node:assert/strict';
import {approvedGeneratedPreview} from '../preview-policy.mjs';
const entry={id:'app:one',source:'cover',review:{policyVersion:1,resourceId:'app:one',faithfulToSource:true,uniqueVisual:true,reviewer:'Reviewer',reviewedAt:'2026-09-21',sceneDescription:'A unique scene showing the app actual dashboard and its source-specific flow.',references:['https://example.com/app'],videoSha256:'a'.repeat(64)}};
test('generic, incomplete and mismatched generated previews cannot publish',()=>{
 assert.equal(approvedGeneratedPreview({source:'cover'}),false);
 assert.equal(approvedGeneratedPreview(entry),true);
 for(const change of [{resourceId:'app:other'},{faithfulToSource:false},{uniqueVisual:false},{reviewer:''},{references:[]},{videoSha256:'bad'},{reviewedAt:'bad'}])assert.equal(approvedGeneratedPreview({...entry,review:{...entry.review,...change}}),false);
});
