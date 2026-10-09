import {describe, expect, it} from 'vitest';
import {configureRiff, newGuessingRiff, readGuessingRiff, SOURCE_REVISION} from './riff';
import {guessingPreview} from './preview';

describe('guessing-game Riff', () => {
  it('retains the official source pin and removes the inherited deployment target', () => {
    const draft = newGuessingRiff();
    expect(draft.sourceRevision).toBe(SOURCE_REVISION);
    expect(draft.files['src/lib.rs']).toContain('SPDX-License-Identifier: BSD-3-Clause');
    expect(draft.files['src/lib.rs']).toContain('guess <= 10');
    expect(draft.files['tari.config.toml']).not.toContain('template-address');
    expect(readGuessingRiff(JSON.parse(JSON.stringify(draft)))).toEqual(draft);
  });
  it('updates native rules while preserving unrelated creator edits and escaping prize text', () => {
    const draft = newGuessingRiff();
    draft.files['src/lib.rs'] += '\n// Creator note';
    const next = configureRiff(draft, {...draft.settings, maxPlayers: 3, prizeName: 'The "Moon" Prize'});
    expect(next.files['src/lib.rs']).toContain('MAXIMUM_GUESSES_PER_ROUND: usize = 3;');
    expect(next.files['src/lib.rs']).toContain('.metadata("name", "The \\"Moon\\" Prize")');
    expect(next.files['src/lib.rs']).toContain('// Creator note');
    expect(next.files['tests/test.rs']).toEqual(draft.files['tests/test.rs']);
  });
  it('does not silently overwrite custom native rule structures', () => {
    const draft = newGuessingRiff();
    draft.files['src/lib.rs'] = '// Completely custom contract';
    expect(() => configureRiff(draft, {...draft.settings, maxPlayers: 4})).toThrow('code editor');
  });
  it('rejects malformed saved files and keeps export paths on the known file list', () => {
    const draft = newGuessingRiff();
    expect(readGuessingRiff({...draft, settings: {...draft.settings, maxPlayers: -1}})).toBeNull();
    expect(readGuessingRiff({...draft, files: {...draft.files, 'src/lib.rs': 4}})).toBeNull();
    const extra = readGuessingRiff({...draft, files: {...draft.files, '../escape': 'bad'}});
    expect(extra?.files).not.toHaveProperty('../escape');
  });
  it('keeps creator text inert inside the sandboxed preview', () => {
    const draft = newGuessingRiff();
    const source = guessingPreview({...draft.settings, title: '</script><script>alert(1)</script>'});
    expect(source.match(/<script>/g)).toHaveLength(1);
    expect(source).toContain('&lt;/script>');
    expect(source).toContain("connect-src 'none'");
    expect(source).toContain('.textContent=config.title');
  });
});
