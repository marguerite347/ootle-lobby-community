import {describe, expect, it} from 'vitest';
import {queueWalletAward} from './walletAward';
describe('confirmed wallet award presentation', () => {
  it('retains the full delta if a spin arrives before the answer reveal', () => {
    const answer = queueWalletAward(null, 0, 100);
    expect(queueWalletAward(answer, 100, 200)).toEqual({from: 0, to: 200});
  });
  it('does not create an award for a repeated or unchanged balance', () => {
    expect(queueWalletAward(null, 750, 750)).toBeNull();
  });
  it('shows only the extra Super reward after the first award was revealed', () => {
    expect(queueWalletAward(null, 750, 7500)).toEqual({from: 750, to: 7500});
  });
});
