/** One in-flight snapshot; local writes invalidate older reads and queue a fresh read. */
export function createSnapshotPoller<T>(read: () => Promise<T>, accept: (value: T) => void, reject: () => void) {
  let running: Promise<void> | null = null;
  let queued = false;
  let generation = 0;
  const refresh = (): Promise<void> => {
    queued = true;
    if (running) return running;
    running = (async () => {
      do {
        queued = false;
        const startedGeneration = generation;
        try {
          const snapshot = await read();
          if (startedGeneration === generation) accept(snapshot);
        } catch {
          if (startedGeneration === generation) reject();
        }
      } while (queued);
    })().finally(() => { running = null; });
    return running;
  };
  return { refresh, afterLocalWrite: () => { generation += 1; return refresh(); } };
}
