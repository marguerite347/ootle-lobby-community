import test from 'node:test';
import assert from 'node:assert/strict';
import {readContestContent} from '../creator-hub/hub/shared/readContestContent.mjs';
import {validateContests} from '../creator-hub/hub/shared/contestContentValidation.mjs';

const contests = readContestContent(new URL('../',import.meta.url));
test('each build gallery accepts only entries from its own official thread', () => {
  const [october,mvp,launch] = contests;
  assert.deepEqual(contests.map(contest => contest.id), ['october-2026','november-2026','first-to-launch-2026']);
  const original = october.entries[0];
  for (const contest of [mvp,launch]) {
    const entry = {...original, sourceUrl:`${contest.threadUrl}/3`};
    assert.equal(validateContests([{...contest,entries:[entry]}])[0].entries.length,1);
    assert.throws(() => validateContests([{...contest,entries:[original]}]), /matching contest thread/);
    assert.throws(() => validateContests([{...contest,entries:[entry,{...entry,slug:'duplicate'}]}]), /unique submission post/);
  }
  assert.throws(() => validateContests([mvp,mvp]), /duplicate contest identity/);
  assert.throws(() => validateContests([{...mvp,threadUrl:launch.threadUrl}]), /contest identity/);
});

test('a reviewed hosted project can be listed without inventing a repository', () => {
  const contest = contests.find(item => item.id === 'november-2026');
  const entry = structuredClone(contest.entries.find(item => item.slug === 'ootle-fee-check'));
  assert.ok(entry && !entry.repoUrl);
  assert.doesNotThrow(() => validateContests([{...contest, entries:[entry]}]));
  assert.throws(() => validateContests([{...contest, entries:[{...entry, demoUrl:undefined}]}]), /source repository or reviewed project destination/);
  assert.throws(() => validateContests([{...contest, entries:[{...entry, demoUrl:'https://unreviewed.invalid/app'}]}]), /maintainer review/);
  assert.throws(() => validateContests([{...contest, entries:[{...entry, repoUrl:'javascript:alert(1)'}]}]), /reviewed public link/);
});
