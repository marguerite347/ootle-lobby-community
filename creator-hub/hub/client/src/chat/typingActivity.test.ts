import { afterEach, describe, expect, it, vi } from "vitest";
import { createTypingActivity, typingLabel } from "./typingActivity";

afterEach(() => vi.useRealTimers());
describe("typing activity", () => {
  it("starts only on editing, throttles pulses and stops on idle", async () => {
    vi.useFakeTimers();
    const publish = vi.fn(async () => {});
    const activity = createTypingActivity(publish);
    expect(publish).not.toHaveBeenCalled();
    activity.edit(true);
    await vi.advanceTimersByTimeAsync(1000);
    activity.edit(true);
    expect(publish.mock.calls).toEqual([[true]]);
    await vi.advanceTimersByTimeAsync(1000);
    activity.edit(true);
    await vi.advanceTimersByTimeAsync(4000);
    expect(publish.mock.calls).toEqual([[true], [true], [false]]);
    activity.stop();
    expect(publish).toHaveBeenCalledTimes(3);
  });
  it("serializes clearing after a delayed pulse, and coalesces queued activity", async () => {
    vi.useFakeTimers();
    let release!: () => void;
    const publish = vi.fn().mockImplementationOnce(() => new Promise<void>((r) => { release = r; })).mockResolvedValue(undefined);
    const activity = createTypingActivity(publish);
    activity.edit(true);
    await vi.advanceTimersByTimeAsync(2000);
    activity.edit(true);
    activity.edit(false);
    expect(publish.mock.calls).toEqual([[true]]);
    release();
    await vi.advanceTimersByTimeAsync(0);
    expect(publish.mock.calls).toEqual([[true], [false]]);
  });
  it("recovers from network failure without preventing further input", async () => {
    vi.useFakeTimers();
    const publish = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    const activity = createTypingActivity(publish);
    activity.edit(true);
    await vi.advanceTimersByTimeAsync(2000);
    activity.edit(true);
    await vi.advanceTimersByTimeAsync(1);
    activity.stop();
    expect(publish.mock.calls).toEqual([[true], [true], [false]]);
  });
  it("names multiple typists without showing a draft", () => {
    expect(typingLabel([])).toBe("");
    expect(typingLabel(["Ari"])).toBe("Ari is typing…");
    expect(typingLabel(["Ari", "Mina"])).toBe("Ari and Mina are typing…");
    expect(typingLabel(["Ari", "Mina", "Sol"])).toBe("Ari, Mina and 1 other are typing…");
  });
});
