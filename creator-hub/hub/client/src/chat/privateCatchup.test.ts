import { expect, test } from "vitest";
import { privateCatchup } from "./privateCatchup";
const row = (n: number) => ({ id: String(n), cursor_at: String(n) });
test("reconnect fills missing middle pages before merging loaded history", async () => {
  const cursors: string[] = [];
  const result = await privateCatchup(
    { messages: [row(7), row(8)], hasMore: true },
    new Set(["3", "4"]),
    async (cursor) => {
      cursors.push(cursor.id);
      return cursor.id === "7"
        ? { messages: [row(5), row(6)], hasMore: true }
        : { messages: [row(3), row(4)], hasMore: true };
    },
  );
  expect(cursors).toEqual(["7", "5"]);
  expect(result.messages.map((r) => r.id)).toEqual([
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
  ]);
  expect(result.reset).toBe(false);
});
test("first load does not fetch all history; very long outages stay bounded", async () => {
  let calls = 0;
  const fetch = async (cursor: ReturnType<typeof row>) => {
    calls++;
    return { messages: [row(Number(cursor.id) - 1)], hasMore: true };
  };
  await privateCatchup(
    { messages: [row(50)], hasMore: true },
    new Set(),
    fetch,
  );
  expect(calls).toBe(0);
  const result = await privateCatchup(
    { messages: [row(50)], hasMore: true },
    new Set(["1"]),
    fetch,
  );
  expect(calls).toBe(10);
  expect(result.reset).toBe(true);
  expect(result.hasMore).toBe(true);
});
