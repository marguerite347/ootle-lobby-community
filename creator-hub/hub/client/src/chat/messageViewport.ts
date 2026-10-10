// Keep the reader's position from before a render adds height to the message list.
// Message IDs, rather than list length, also handle a full rolling history window.
export function createMessageViewport() {
  let context = "";
  let known = new Set<string>();
  let unread = new Set<string>();
  let following = true;

  return {
    get following() { return following; },
    prepend(ids: string[]) {
      for (const id of ids) known.add(id);
      following = false;
    },
    follow() {
      following = true;
      unread.clear();
    },
    scrolled({ scrollHeight, scrollTop, clientHeight }: {
      scrollHeight: number; scrollTop: number; clientHeight: number;
    }) {
      following = scrollHeight - scrollTop - clientHeight <= 48;
      if (following) unread.clear();
      return unread.size;
    },
    receive(nextContext: string, ids: string[], startAtLatest = true) {
      const reset = context !== nextContext;
      if (reset) {
        context = nextContext;
        unread.clear();
        following = startAtLatest;
      } else if (!following) {
        for (const id of ids) if (!known.has(id)) unread.add(id);
      }
      known = new Set(ids);
      unread = new Set([...unread].filter(id => known.has(id)));
      if (following) unread.clear();
      return {
        unread: unread.size,
        scrollTo: following ? "latest" as const : reset ? "start" as const : null,
      };
    },
  };
}
