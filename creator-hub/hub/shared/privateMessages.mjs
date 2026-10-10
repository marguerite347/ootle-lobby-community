// INTEGRATION_GAP[LOBBY-CHAT] (build-required): optional encrypted DMs are implemented; recovery, external bridges and production retention verification remain open. See docs/DEVELOPMENT_GAPS.md#lobby-chat.
// Adapted from Caravel Labs' wrapMessage/unwrapMessage (MIT), revision
// e5edec70b4c3ea64a008d0837e4613aeee2116b3. Full notice: /chat-notices.txt.
// Reuses nostr-tools NIP-44/59 primitives, not Caravel's wallet or relay provider.
import { getPublicKey, getEventHash, verifyEvent } from "nostr-tools/pure";
import { wrapEvent } from "nostr-tools/nip59";
import { getConversationKey, decrypt } from "nostr-tools/nip44";

export const MAX_PRIVATE_BYTES = 4000;
export function messageEnvelopes(secret, recipient, conversation, id, body) {
  if (
    typeof body !== "string" ||
    !body.trim() ||
    new TextEncoder().encode(body).length > MAX_PRIVATE_BYTES
  )
    throw new Error("Write a message of up to 4,000 bytes.");
  const rumor = {
    kind: 14,
    created_at: Math.floor(Date.now() / 1000),
    content: body,
    tags: [
      ["p", recipient],
      ["ootle-dm", conversation, id],
    ],
  };
  return {
    senderWrap: wrapEvent(rumor, secret, getPublicKey(secret)),
    recipientWrap: wrapEvent(rumor, secret, recipient),
  };
}

export function openMessage(secret, envelope, expected) {
  // Parse a fresh wire object so a cached verification symbol cannot mask edits.
  const wrap = JSON.parse(JSON.stringify(envelope));
  const self = getPublicKey(secret);
  if (
    wrap.kind !== 1059 ||
    !verifyEvent(wrap) ||
    wrap.tags.length !== 1 ||
    JSON.stringify(wrap.tags[0]) !== JSON.stringify(["p", self])
  )
    throw new Error("Invalid private message envelope.");
  const seal = JSON.parse(
    decrypt(wrap.content, getConversationKey(secret, wrap.pubkey)),
  );
  if (
    seal.kind !== 13 ||
    seal.tags.length !== 0 ||
    !verifyEvent(seal) ||
    seal.pubkey !== expected.sender
  )
    throw new Error("The private message sender could not be verified.");
  const rumor = JSON.parse(
    decrypt(seal.content, getConversationKey(secret, seal.pubkey)),
  );
  if (
    rumor.sig !== undefined ||
    rumor.pubkey !== seal.pubkey ||
    rumor.kind !== 14 ||
    getEventHash(rumor) !== rumor.id ||
    rumor.tags.length !== 2 ||
    JSON.stringify(rumor.tags) !==
      JSON.stringify([
        ["p", expected.recipient],
        ["ootle-dm", expected.conversation, expected.id],
      ]) ||
    typeof rumor.content !== "string" ||
    !rumor.content.trim() ||
    new TextEncoder().encode(rumor.content).length > MAX_PRIVATE_BYTES
  )
    throw new Error("The private message does not match this conversation.");
  return rumor.content;
}
