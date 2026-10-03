export const TRIVIA_COPY = {
  win: ['You nailed it.', 'You cooked.', 'That’s the one.'],
  finale: ['LOOT SECURED!', 'SPARKS STACKED!', 'YOU COOKED!'],
  miss: ['Not this round.', 'Keep that knowledge.', 'Tomorrow, run it back.'],
} as const;
type Outcome = keyof typeof TRIVIA_COPY;
type CopyStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** Advance per outcome, once per round. Reloads keep the same line. Cosmetic only. */
export function nextTriviaCopy(outcome: Outcome, roundId: string, storage: CopyStorage): string {
  const choices = TRIVIA_COPY[outcome];
  const key = `ootle:trivia-copy:${outcome}`;
  try {
    const saved = JSON.parse(storage.getItem(key) || 'null');
    const valid = saved && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < choices.length;
    const index = valid ? (saved.roundId === roundId ? saved.index : (saved.index + 1) % choices.length) : 0;
    storage.setItem(key, JSON.stringify({roundId, index}));
    return choices[index];
  } catch {
    return choices[0];
  }
}
