import type { Event } from "nostr-tools/pure";
export const MAX_PRIVATE_BYTES: number;
export function messageEnvelopes(
  secret: Uint8Array,
  recipient: string,
  conversation: string,
  id: string,
  body: string,
): { senderWrap: Event; recipientWrap: Event };
export function openMessage(
  secret: Uint8Array,
  envelope: Event,
  expected: {
    sender: string;
    recipient: string;
    conversation: string;
    id: string;
  },
): string;
