export type WalletAward = {from: number; to: number};
/** Retain the earliest unrevealed balance when confirmed gains arrive quickly. */
export function queueWalletAward(pending: WalletAward | null, prior: number, next: number): WalletAward | null {
  return next > prior ? {from: pending?.from ?? prior, to: next} : pending;
}
