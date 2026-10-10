import { expect, test } from "vitest";
import { createMessageViewport } from "./messageViewport";

test("initial history and a tall batch follow the position before new messages render", () => {
  const view = createMessageViewport();
  expect(view.receive("lobby", ["a", "b"]).scrollTo).toBe("latest");
  view.scrolled({ scrollHeight: 1000, scrollTop: 600, clientHeight: 400 });
  // Three tall replies can add more than the old 350px post-render threshold.
  expect(view.receive("lobby", ["a", "b", "c", "d", "e"])).toEqual({ unread: 0, scrollTo: "latest" });
});

test("reading older messages preserves position and counts each new ID once", () => {
  const view = createMessageViewport();
  view.receive("lobby", ["a", "b"]);
  view.scrolled({ scrollHeight: 1000, scrollTop: 100, clientHeight: 400 });
  expect(view.receive("lobby", ["a", "b", "c", "d"])).toEqual({ unread: 2, scrollTo: null });
  expect(view.receive("lobby", ["a", "b", "c", "d"]).unread).toBe(2);
  // The server trims the oldest item: length is unchanged, but another post arrived.
  expect(view.receive("lobby", ["b", "c", "d", "e"]).unread).toBe(3);
  expect(view.receive("lobby", ["b", "c", "e"]).unread).toBe(2);
});

test("jumping or manually reaching the bottom clears unread and resumes following", () => {
  for (const manual of [false, true]) {
    const view = createMessageViewport();
    view.receive("lobby", ["a"]);
    view.scrolled({ scrollHeight: 1000, scrollTop: 0, clientHeight: 400 });
    view.receive("lobby", ["a", "b"]);
    if (manual) expect(view.scrolled({ scrollHeight: 1200, scrollTop: 799.5, clientHeight: 400 })).toBe(0);
    else view.follow();
    expect(view.receive("lobby", ["a", "b", "c"])).toEqual({ unread: 0, scrollTo: "latest" });
  }
});

test("changing channels or threads resets unread; search starts at the first result", () => {
  const view = createMessageViewport();
  view.receive("lobby", ["a"]);
  view.scrolled({ scrollHeight: 1000, scrollTop: 0, clientHeight: 400 });
  view.receive("lobby", ["a", "b"]);
  expect(view.receive("lobby/thread-a", ["a", "reply"])).toEqual({ unread: 0, scrollTo: "latest" });
  expect(view.receive("builders", ["c"])).toEqual({ unread: 0, scrollTo: "latest" });
  expect(view.receive("builders/search", ["c"], false)).toEqual({ unread: 0, scrollTo: "start" });
});
