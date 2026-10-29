/** One server-clock boundary per account and mounted chat visit; never persisted. */
export function createMessageVisit(readStart: () => Promise<string>) {
  const starts = new Map<string, Promise<string>>();
  return {
    start(accountId: string) {
      let pending = starts.get(accountId);
      if (!pending) {
        pending = readStart().then((value) => {
          if (!value || !Number.isFinite(Date.parse(value))) throw new Error('Chat could not start a fresh view.');
          return value;
        }).catch((error) => {
          starts.delete(accountId);
          throw error;
        });
        starts.set(accountId, pending);
      }
      return pending;
    },
  };
}
