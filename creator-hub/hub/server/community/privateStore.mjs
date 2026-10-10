// INTEGRATION_GAP[LOBBY-CHAT] (build-required): optional encrypted DMs are implemented; recovery, external bridges and production retention verification remain open. See docs/DEVELOPMENT_GAPS.md#lobby-chat.
import { randomBytes, randomUUID } from "node:crypto";
import { verifyEvent } from "nostr-tools/pure";

const keyPattern = /^[a-f0-9]{64}$/;
const idPattern =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export function createPrivateStore(db, { actor, reject }) {
  async function identity(q, accountId) {
    return (
      (
        await q.query(
          "SELECT pubkey FROM community_chat.private_identities WHERE account_id=$1",
          [accountId],
        )
      ).rows[0]?.pubkey || null
    );
  }
  async function contact(q, accountId, id, lock = false) {
    const row = (
      await q.query(
        `SELECT * FROM community_chat.private_contacts WHERE id=$1 AND $2 IN (low_id,high_id) ${lock ? "FOR UPDATE" : ""}`,
        [id, accountId],
      )
    ).rows[0];
    if (!row) reject("Private conversation not found.", 404);
    return row;
  }
  function envelope(value, key) {
    if (!value || typeof value !== "object")
      reject("Invalid encrypted message.");
    const event = Object.fromEntries(
      ["id", "pubkey", "kind", "created_at", "content", "tags", "sig"].map(
        (k) => [k, value[k]],
      ),
    );
    if (
      event.kind !== 1059 ||
      !Number.isSafeInteger(event.created_at) ||
      typeof event.content !== "string" ||
      event.content.length < 132 ||
      event.content.length > 16384 ||
      !/^[A-Za-z0-9+/=]+$/.test(event.content) ||
      JSON.stringify(event.tags) !== JSON.stringify([["p", key]]) ||
      !verifyEvent(event)
    )
      reject("Invalid encrypted message.");
    return event;
  }
  return {
    async overview(accountId) {
      await actor(db, accountId);
      const contacts = (
        await db.query(
          `SELECT c.*,a.id AS peer_id,a.name AS peer_name,k.pubkey AS peer_key,
        (SELECT count(*)::int FROM community_chat.private_messages m WHERE m.contact_id=c.id AND m.recipient_id=$1 AND m.received_at IS NULL) AS unread,
        (SELECT max(created_at) FROM community_chat.private_messages m WHERE m.contact_id=c.id) AS latest_at
        FROM community_chat.private_contacts c JOIN community_chat.accounts a ON a.id=CASE WHEN c.low_id=$1 THEN c.high_id ELSE c.low_id END
        LEFT JOIN community_chat.private_identities k ON k.account_id=a.id
        WHERE $1 IN(c.low_id,c.high_id) ORDER BY c.updated_at DESC,c.id`,
          [accountId],
        )
      ).rows;
      return { pubkey: await identity(db, accountId), contacts };
    },
    async challenge(accountId, pubkey, origin) {
      if (typeof pubkey !== "string" || !keyPattern.test(pubkey))
        reject("Invalid messaging key.");
      return db.transaction(async (q) => {
        await actor(q, accountId, true);
        const existing = await identity(q, accountId);
        if (existing && existing !== pubkey)
          reject(
            "This guest already has a private messaging key. Use its original browser storage.",
            409,
          );
        const nonce = randomBytes(32).toString("hex");
        await q.query(
          `INSERT INTO community_chat.private_challenges(account_id,pubkey,nonce,expires_at) VALUES($1,$2,$3,now()+interval '5 minutes')
          ON CONFLICT(account_id) DO UPDATE SET pubkey=$2,nonce=$3,expires_at=now()+interval '5 minutes'`,
          [accountId, pubkey, nonce],
        );
        return {
          kind: 27235,
          content: JSON.stringify({
            purpose: "ootle-private-chat",
            accountId,
            nonce,
          }),
          tags: [
            ["u", origin + "/api/chat/private/identity"],
            ["method", "POST"],
          ],
        };
      });
    },
    async bind(accountId, input, origin) {
      const event = JSON.parse(JSON.stringify(input ?? {}));
      if (
        event.kind !== 27235 ||
        !verifyEvent(event) ||
        Math.abs(event.created_at - Math.floor(Date.now() / 1000)) > 300
      )
        reject("Private messaging key proof is invalid or expired.");
      return db.transaction(async (q) => {
        await actor(q, accountId, true);
        const challenge = (
          await q.query(
            "SELECT * FROM community_chat.private_challenges WHERE account_id=$1 AND expires_at>now() FOR UPDATE",
            [accountId],
          )
        ).rows[0];
        if (
          !challenge ||
          challenge.pubkey !== event.pubkey ||
          event.content !==
            JSON.stringify({
              purpose: "ootle-private-chat",
              accountId,
              nonce: challenge.nonce,
            }) ||
          JSON.stringify(event.tags) !==
            JSON.stringify([
              ["u", origin + "/api/chat/private/identity"],
              ["method", "POST"],
            ])
        )
          reject("Private messaging key proof is invalid or expired.");
        const old = await identity(q, accountId);
        if (old && old !== event.pubkey)
          reject("This guest already has a private messaging key.", 409);
        const inserted = await q.query(
          `INSERT INTO community_chat.private_identities(account_id,pubkey) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING pubkey`,
          [accountId, event.pubkey],
        );
        if (!inserted.rows.length && old !== event.pubkey)
          reject("This messaging key belongs to another guest.", 409);
        await q.query(
          "DELETE FROM community_chat.private_challenges WHERE account_id=$1",
          [accountId],
        );
        return { pubkey: event.pubkey };
      });
    },
    async request(accountId, peerId) {
      if (typeof peerId !== "string" || peerId === accountId)
        reject("Choose another participant.");
      return db.transaction(async (q) => {
        await actor(q, accountId, true);
        if (!(await identity(q, accountId)))
          reject("Enable private messages first.", 409);
        const peer = (
          await q.query(
            "SELECT id FROM community_chat.accounts WHERE id=$1 AND NOT blocked",
            [peerId],
          )
        ).rows[0];
        const visible = (
          await q.query(
            `SELECT m.id FROM community_chat.messages m JOIN community_chat.channels c ON c.id=m.channel_id
          WHERE m.account_id=$2 AND m.hidden_at IS NULL AND (c.visibility='workspace' OR EXISTS(SELECT 1 FROM community_chat.channel_members cm WHERE cm.channel_id=c.id AND cm.account_id=$1)) LIMIT 1`,
            [accountId, peerId],
          )
        ).rows.length;
        if (!peer || !visible) reject("Participant not available.", 404);
        const [low, high] = [accountId, peerId].sort();
        await q.query(
          `INSERT INTO community_chat.private_contacts(id,low_id,high_id,requester_id,state,action_by) VALUES($1,$2,$3,$4,'pending',$4) ON CONFLICT(low_id,high_id) DO NOTHING`,
          [randomUUID(), low, high, accountId],
        );
        const row = (
          await q.query(
            "SELECT * FROM community_chat.private_contacts WHERE low_id=$1 AND high_id=$2 FOR UPDATE",
            [low, high],
          )
        ).rows[0];
        if (row.state === "blocked")
          reject("This private conversation is blocked.", 409);
        // A declined request stays declined. Only the person who declined can reopen it.
        if (row.state === "declined") reject("This request was declined.", 409);
        return { id: row.id };
      });
    },
    async respond(accountId, id, action) {
      if (!["accept", "decline", "block", "unblock"].includes(action))
        reject("Choose a contact action.");
      return db.transaction(async (q) => {
        await actor(q, accountId, true);
        const c = await contact(q, accountId, id, true);
        const peer = c.low_id === accountId ? c.high_id : c.low_id;
        await actor(q, peer);
        let state = c.state;
        if (action === "block") {
          if (c.state === "blocked") return { ok: true };
          state = "blocked";
        } else if (action === "unblock") {
          if (c.state !== "blocked" || c.action_by !== accountId)
            reject("Only the person who blocked can unblock.", 403);
          state = "declined";
        } else {
          if (c.state === "blocked")
            reject("Unblock before reopening this conversation.", 409);
          if (
            (c.state === "pending" && c.requester_id === accountId) ||
            (c.state === "declined" && c.action_by !== accountId)
          )
            reject("Wait for the other participant to respond.", 403);
          if (action === "accept") {
            if (!(await identity(q, accountId)) || !(await identity(q, peer)))
              reject("Both participants need private messaging enabled.", 409);
            state = "accepted";
          } else state = "declined";
        }
        await q.query(
          "UPDATE community_chat.private_contacts SET state=$2,action_by=$3,updated_at=now() WHERE id=$1",
          [id, state, accountId],
        );
        return { ok: true };
      });
    },
    async send(accountId, id, input) {
      if (
        !input ||
        Object.keys(input).some(
          (k) => !["id", "senderWrap", "recipientWrap"].includes(k),
        ) ||
        !idPattern.test(input.id)
      )
        reject("Invalid private message.");
      return db.transaction(async (q) => {
        await actor(q, accountId, true);
        const c = await contact(q, accountId, id, true);
        if (c.state !== "accepted")
          reject("Accept the contact request before messaging.", 409);
        const peer = c.low_id === accountId ? c.high_id : c.low_id;
        await actor(q, peer);
        const senderKey = await identity(q, accountId),
          recipientKey = await identity(q, peer);
        if (!senderKey || !recipientKey)
          reject("Private messaging is not enabled.", 409);
        const sw = envelope(input.senderWrap, senderKey),
          rw = envelope(input.recipientWrap, recipientKey);
        const old = (
          await q.query(
            "SELECT * FROM community_chat.private_messages WHERE id=$1",
            [input.id],
          )
        ).rows[0];
        if (old) {
          if (
            old.sender_id !== accountId ||
            old.contact_id !== id ||
            old.sender_wrap.id !== sw.id ||
            old.recipient_wrap.id !== rw.id
          )
            reject("Message ID already used.", 409);
          return { id: old.id };
        }
        await q.query(
          `INSERT INTO community_chat.private_messages(id,contact_id,sender_id,recipient_id,sender_key,recipient_key,sender_wrap,recipient_wrap)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            input.id,
            id,
            accountId,
            peer,
            senderKey,
            recipientKey,
            JSON.stringify(sw),
            JSON.stringify(rw),
          ],
        );
        await q.query(
          "UPDATE community_chat.private_contacts SET updated_at=now() WHERE id=$1",
          [id],
        );
        return { id: input.id };
      });
    },
    async messages(accountId, id, { before, beforeId } = {}) {
      await actor(db, accountId);
      const c = await contact(db, accountId, id);
      if (c.state === "blocked")
        reject("This private conversation is blocked.", 409);
      if (
        (before &&
          (typeof before !== "string" ||
            !Number.isFinite(Date.parse(before)))) ||
        (beforeId && !idPattern.test(beforeId))
      )
        reject("Invalid history cursor.");
      const rows = (
        await db.query(
          `SELECT id,sender_id,recipient_id,sender_key,recipient_key,created_at,created_at::text AS cursor_at,received_at,
        CASE WHEN sender_id=$2 THEN sender_wrap ELSE recipient_wrap END AS envelope
        FROM community_chat.private_messages WHERE contact_id=$1 AND $2 IN(sender_id,recipient_id)
        AND ($3::timestamptz IS NULL OR (created_at,id)<($3::timestamptz,$4::text)) ORDER BY created_at DESC,id DESC LIMIT 51`,
          [id, accountId, before || null, beforeId || null],
        )
      ).rows;
      return {
        messages: rows.slice(0, 50).reverse(),
        hasMore: rows.length > 50,
      };
    },
    async received(accountId, id, messageId) {
      await actor(db, accountId);
      const c = await contact(db, accountId, id);
      if (c.state === "blocked")
        reject("This private conversation is blocked.", 409);
      await db.query(
        "UPDATE community_chat.private_messages SET received_at=COALESCE(received_at,now()) WHERE contact_id=$1 AND id=$2 AND recipient_id=$3",
        [id, messageId, accountId],
      );
      return { ok: true };
    },
  };
}
