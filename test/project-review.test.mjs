import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {withProjectReviewNote} from '../creator-hub/hub/shared/projectReview.mjs';
import {withContestEntries} from '../creator-hub/hub/server/contestEntries.mjs';

test('gallery and resource details share dated reviews without replacing imported descriptions',()=>{
  for (const slug of ['shadowtix','tariorg','threshold','threshold-bounties']) {
    const project=JSON.parse(readFileSync(new URL(`../content/projects/${slug}.json`,import.meta.url),'utf8'));
    const original={id:project.id,summary:'A newer creator description.',preview:{video:'retained.mp4'}};
    const resource=withContestEntries([original]).find(item=>item.id===project.id);
    const gallery=withProjectReviewNote(project.summary,project.reviewNote);
    assert.ok(gallery.includes(project.reviewNote));
    assert.ok(resource.summary.includes(project.reviewNote));
    assert.ok(resource.summary.startsWith(original.summary));
    assert.deepEqual(resource.preview,original.preview);
    assert.equal(withProjectReviewNote(gallery,project.reviewNote),gallery);
    assert.equal(withContestEntries([resource]).find(item=>item.id===project.id).summary,resource.summary);
  }
  const original={id:'tari-ootle:app:sapient',summary:'A newer Sapient release.'};
  assert.equal(withContestEntries([original]).find(item=>item.id===original.id).summary,original.summary);
});
