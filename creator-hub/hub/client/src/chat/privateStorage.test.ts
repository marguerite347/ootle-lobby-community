import { beforeAll, expect, test } from "vitest";
import { indexedDB } from "fake-indexeddb";
import { getPublicKey } from "nostr-tools/pure";
import {
  loadPrivateDraft,
  privateKey,
  savePrivateDraft,
} from "./privateStorage";
beforeAll(() => {
  Object.defineProperty(globalThis, "indexedDB", {
    value: indexedDB,
    configurable: true,
  });
});
async function record(key: string) {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("ootle-private-chat", 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return new Promise<any>((resolve, reject) => {
    const request = database
      .transaction("records")
      .objectStore("records")
      .get(key);
    request.onsuccess = () => {
      resolve(request.result);
      database.close();
    };
    request.onerror = () => reject(request.error);
  });
}
test("opt-in keys converge across simultaneous tabs and persist with nonextractable wrapping", async () => {
  expect(await privateKey("off", null)).toBeNull();
  const [a, b] = await Promise.all([
    privateKey("guest-a", null, true),
    privateKey("guest-a", null, true),
  ]);
  expect(a).not.toBeNull();
  expect(b).toEqual(a);
  expect(await privateKey("guest-a", getPublicKey(a!))).toEqual(a);
  const stored = await record("identity:guest-a");
  expect(stored.wrapper.extractable).toBe(false);
  expect(stored.secret.bytes).toBeInstanceOf(ArrayBuffer);
  expect(new Uint8Array(stored.secret.bytes)).not.toEqual(a);
});
test("missing or mismatched keys fail rather than silently rotate", async () => {
  const old = (await privateKey("guest-old", null, true))!;
  await expect(
    privateKey("empty-browser", getPublicKey(old), true),
  ).rejects.toThrow("missing");
  const other = (await privateKey("guest-other", null, true))!;
  await expect(
    privateKey("guest-old", getPublicKey(other), true),
  ).rejects.toThrow("different");
  expect(await privateKey("guest-old", getPublicKey(old))).toEqual(old);
});
test("draft writes preserve the newest text, encrypt at rest and retain exact retry identity", async () => {
  await privateKey("guest-draft", null, true);
  const state = {
    text: "secret synthetic draft",
    pending: {
      id: "same-id-after-reload",
      senderWrap: { content: "ciphertext" },
    },
  };
  await Promise.all([
    savePrivateDraft("guest-draft", "peer", { text: "old" }),
    savePrivateDraft("guest-draft", "peer", state),
  ]);
  expect(await loadPrivateDraft("guest-draft", "peer")).toEqual(state);
  const stored = await record("draft:guest-draft:peer");
  expect(stored.text).toBeUndefined();
  expect(new TextDecoder().decode(stored.bytes)).not.toContain(state.text);
  expect(await loadPrivateDraft("guest-other", "peer")).toBeUndefined();
  await savePrivateDraft("guest-draft", "peer", undefined);
  expect(await loadPrivateDraft("guest-draft", "peer")).toBeUndefined();
});
