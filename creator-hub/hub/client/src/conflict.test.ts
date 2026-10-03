import { describe, it, expect } from 'vitest';
import { enterConflict, resolveOverwrite, resolveDiscard } from './conflict';

// Two-editor regression: Alice and Bob open the same version, Alice saves, Bob's save
// gets a 409. The losing editor (Bob) must retain his unsaved input.
describe('save conflict preserves the losing editor draft', () => {
  const bobDraft = { notes: 'bob was here', components: [{ id: 'bob-token' }] };
  const aliceLatest = { head: 'alicehead', notes: 'alice change', components: [{ id: 'alice-fungible' }] };

  it('entering conflict does NOT overwrite Bob\'s draft', () => {
    const r = enterConflict(bobDraft, aliceLatest);
    expect(r.draft.notes).toBe('bob was here');
    expect(r.draft.components).toEqual([{ id: 'bob-token' }]);
    // latest is stored separately for comparison, not merged into the draft
    expect(r.conflict).toEqual(aliceLatest);
    // and the returned draft is a copy, not Alice's data
    expect(r.draft.components).not.toBe(aliceLatest.components);
  });

  it('overwrite keeps Bob\'s content and targets the latest head', () => {
    const r = resolveOverwrite(bobDraft, aliceLatest);
    expect(r.notes).toBe('bob was here');
    expect(r.components).toEqual([{ id: 'bob-token' }]);
    expect(r.expectedHead).toBe('alicehead');
  });

  it('discard is an explicit opt-in that takes the latest content', () => {
    const r = resolveDiscard(aliceLatest);
    expect(r.notes).toBe('alice change');
    expect(r.components).toEqual([{ id: 'alice-fungible' }]);
    expect(r.expectedHead).toBe('alicehead');
  });
});
