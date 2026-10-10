import { generateSecretKey, getPublicKey } from "nostr-tools/pure";

// Browser storage protects against accidental plaintext persistence, not malicious
// same-origin scripts. Neither this wrapping key nor the DM key is a wallet key.
type Sealed = { iv: Uint8Array<ArrayBuffer>; bytes: ArrayBuffer };
type Identity = { wrapper: CryptoKey; secret: Sealed };
let database: Promise<IDBDatabase> | undefined;
function db() {
  return (database ||= new Promise((resolve, reject) => {
    const request = indexedDB.open("ootle-private-chat", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("records");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      database = undefined;
      reject(
        new Error(
          "Private messages need browser storage. Public chat is still available.",
        ),
      );
    };
  }));
}
async function read<T>(key: string): Promise<T | undefined> {
  const store = (await db()).transaction("records").objectStore("records");
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function write(key: string, value: unknown, add = false) {
  const transaction = (await db()).transaction("records", "readwrite");
  const store = transaction.objectStore("records");
  if (value === undefined) store.delete(key);
  else if (add) store.add(value, key);
  else store.put(value, key);
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error);
    transaction.onerror = () => reject(transaction.error);
  });
}
async function seal(
  wrapper: CryptoKey,
  bytes: Uint8Array<ArrayBuffer>,
): Promise<Sealed> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return {
    iv,
    bytes: await crypto.subtle.encrypt({ name: "AES-GCM", iv }, wrapper, bytes),
  };
}
export async function privateKey(
  account: string,
  expected: string | null,
  create = false,
) {
  const name = "identity:" + account;
  let record = await read<Identity>(name);
  if (!record && expected)
    throw new Error(
      "Your private messaging key is missing here. Use the original browser. Public chat is still available.",
    );
  if (!record && create) {
    const wrapper = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    const secret = new Uint8Array(generateSecretKey());
    const candidate = { wrapper, secret: await seal(wrapper, secret) };
    secret.fill(0);
    // Unique insert makes two simultaneous tabs converge on one key.
    try {
      await write(name, candidate, true);
    } catch (error) {
      if (!(await read(name))) throw error;
    }
    record = await read<Identity>(name);
  }
  if (!record) return null;
  const bytes = new Uint8Array(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: record.secret.iv },
      record.wrapper,
      record.secret.bytes,
    ),
  );
  if (expected && getPublicKey(bytes) !== expected) {
    bytes.fill(0);
    throw new Error(
      "This browser has a different private messaging key. Use the original browser; your existing key will not be replaced.",
    );
  }
  return bytes;
}
// Serialize writes so a slow draft encryption cannot overwrite a newer draft.
const writes = new Map<string, Promise<void>>();
export function savePrivateDraft(
  account: string,
  contact: string,
  value: unknown,
) {
  const name = "draft:" + account + ":" + contact;
  const work = (writes.get(name) || Promise.resolve())
    .catch(() => {})
    .then(async () => {
      const record = await read<Identity>("identity:" + account);
      if (!record) throw new Error("Private messaging key unavailable.");
      await write(
        name,
        value === undefined
          ? undefined
          : await seal(
              record.wrapper,
              new TextEncoder().encode(JSON.stringify(value)),
            ),
      );
    });
  writes.set(name, work);
  void work
    .finally(() => {
      if (writes.get(name) === work) writes.delete(name);
    })
    .catch(() => {});
  return work;
}
export async function loadPrivateDraft<T>(
  account: string,
  contact: string,
): Promise<T | undefined> {
  await writes.get("draft:" + account + ":" + contact);
  const record = await read<Identity>("identity:" + account);
  const draft = await read<Sealed>("draft:" + account + ":" + contact);
  if (!record || !draft) return;
  return JSON.parse(
    new TextDecoder().decode(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: draft.iv },
        record.wrapper,
        draft.bytes,
      ),
    ),
  );
}
