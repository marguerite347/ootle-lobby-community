/** Publish activity only after an edit, never merely because a draft exists. */
export function createTypingActivity(publish: (active: boolean) => Promise<unknown>) {
  let active = false;
  let lastPublished = -Infinity;
  let idle: ReturnType<typeof setTimeout> | undefined;
  let pending: boolean | undefined;
  let running: Promise<void> | undefined;
  function enqueue(value: boolean) {
    pending = value;
    if (!running) {
      running = (async () => {
        while (pending !== undefined) {
          const next = pending;
          pending = undefined;
          try { await publish(next); } catch { /* Activity must never block a message. */ }
        }
      })().finally(() => { running = undefined; });
    }
  }
  function stop() {
    clearTimeout(idle);
    if (active) enqueue(false);
    active = false;
  }
  return {
    edit(hasText: boolean) {
      if (!hasText) { stop(); return; }
      if (!active || Date.now() - lastPublished >= 2000) {
        enqueue(true);
        lastPublished = Date.now();
      }
      active = true;
      clearTimeout(idle);
      idle = setTimeout(stop, 4000);
    },
    stop,
  };
}

export function typingLabel(names: string[]) {
  if (!names.length) return "";
  if (names.length === 1) return `${names[0]} is typing…`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`;
  return `${names[0]}, ${names[1]} and ${names.length - 2} ${names.length === 3 ? "other" : "others"} are typing…`;
}
