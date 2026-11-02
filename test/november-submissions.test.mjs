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
