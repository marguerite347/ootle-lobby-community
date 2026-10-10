import { afterEach, expect, test, vi } from "vitest";
import { ensureGuestSession } from "./communityAppApi";

afterEach(() => vi.unstubAllGlobals());

test("simultaneous chat mounts share one guest join and use a cross-tab lock", async () => {
  let complete!: (response: Response) => void;
  const fetcher = vi.fn(() => new Promise<Response>(resolve => { complete = resolve; }));
  const lock = vi.fn((_name: string, callback: () => Promise<unknown>) => callback());
  vi.stubGlobal("fetch", fetcher);
  vi.stubGlobal("navigator", { locks: { request: lock } });
  const first = ensureGuestSession(), second = ensureGuestSession();
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(lock).toHaveBeenCalledWith("ootle-chat-guest-session", expect.any(Function));
  const account = { id: "guest-123", name: "Cosmic Otter 1234", role: "member" };
  complete(new Response(JSON.stringify({ account })));
  expect(await first).toEqual({ account });
  expect(await second).toEqual({ account });
});

test("failed automatic joins allow an explicit retry without requiring a name", async () => {
  const fetcher = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ error: "Try again" }), { status: 503 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ account: { id: "guest-new" } })));
  vi.stubGlobal("fetch", fetcher);
  vi.stubGlobal("navigator", {});
  await expect(ensureGuestSession()).rejects.toThrow("Try again");
  await expect(ensureGuestSession()).resolves.toEqual({ account: { id: "guest-new" } });
  expect(fetcher.mock.calls[1][1].body).toBe("{}");
});
