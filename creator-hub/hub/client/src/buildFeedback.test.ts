import {describe,it,expect} from 'vitest';
import {emptyFeedback,feedbackError,feedbackMarkdown,feedbackIssueUrl} from './buildFeedback';
const report={...emptyFeedback,goal:'A puzzle',context:'Godot 4, commit abc',friction:'Could not register the playable result'};
describe('build feedback',()=>{
 it('requires useful context and preserves unknown versus zero',()=>{expect(feedbackError(emptyFeedback)).not.toBe('');expect(feedbackError(report)).toBe('');expect(feedbackMarkdown(report)).toContain('Minutes: Unknown');expect(feedbackMarkdown({...report,minutes:'0'})).toContain('Minutes: 0');});
 it('rejects invalid metrics and obvious credentials before sharing',()=>{for(const minutes of ['-1','Infinity','no'])expect(feedbackError({...report,minutes})).not.toBe('');expect(feedbackError({...report,corrections:'1.5'})).not.toBe('');expect(feedbackError({...report,evidence:'hf_abcdefghijklmnopqrstuvwxyz'})).not.toBe('');});
 it('preserves text and encodes a review draft without submitting',()=>{const body=feedbackMarkdown({...report,goal:'Puzzle & cards #1'});const url=new URL(feedbackIssueUrl(report,body));expect(url.hostname).toBe('github.com');expect(url.searchParams.get('body')).toBe(body);expect(body).toContain('Unreviewed');expect(body).toContain('Not reported; do not infer skill use.');});
});
