// INTEGRATION_GAP[CFG-FORUM-CHAT] (configuration-required): requires forum-admin hooks and live two-way verification. See docs/FORUM_CHAT_BRIDGE.md.
import { createHmac, createHash, timingSafeEqual, randomUUID } from "node:crypto";
import { reject } from "./store.mjs";

export const FORUM_ORIGIN = "https://community.tari.com";
export const FORUM_CHANNEL_URL = `${FORUM_ORIGIN}/chat/c/general/2`;
export const FORUM_DESTINATION = "forum-general";
const clean = (value, max) => typeof value === "string"
  ? value.replace(/[\u0000-\u0008\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "").trim().slice(0, max) : "";
const numericId = value => /^[1-9]\d{0,17}$/.test(String(value));
const digest = value => createHash("sha256").update(value).digest("hex");
const equal = (a, b) => typeof a === "string" && Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export function forumBridgeConfig(env) {
  if (env.CHAT_FORUM_ENABLED !== "1") return null;
  const incomingUrl = new URL(env.CHAT_FORUM_INCOMING_URL || "https://invalid.invalid");
  if (incomingUrl.origin !== FORUM_ORIGIN || !/^\/chat\/hooks\/[A-Za-z0-9_-]+$/.test(incomingUrl.pathname) || incomingUrl.search || incomingUrl.hash || incomingUrl.username || incomingUrl.password)
    throw new Error("Forum chat requires a General-channel incoming webhook on community.tari.com.");
  for (const key of ["CHAT_FORUM_WEBHOOK_SECRET", "CRON_SECRET"])
    if (typeof env[key] !== "string" || env[key].length < 32) throw new Error(`Missing forum bridge configuration: ${key}`);
  const startsAt = env.CHAT_FORUM_STARTS_AT;
  if (!startsAt || !Number.isFinite(Date.parse(startsAt))) throw new Error("Set CHAT_FORUM_STARTS_AT to the approved activation time.");
  return { incomingUrl: incomingUrl.href, secret: env.CHAT_FORUM_WEBHOOK_SECRET, cronSecret: env.CRON_SECRET, startsAt };
}

// Preserve text, but do not let an unverified guest trigger forum mentions or HTML.
const forumText = text => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/@/g, "@\u200b");
export function forumPost(message) {
  const name = forumText(message.author_name).replace(/[\\`*_\[\]]/g, "\\$&");
  const reply = message.parent_id ? `Reply from Lobby · ${forumText(message.parent_author || "community member")}\n\n` : "";
  return `**${name} · From Lobby**\n\n${reply}${forumText(message.body)}\n\n<!-- tari-lobby:${message.id} -->`;
}

export function createForumBridge(db, config, { fetcher = fetch } = {}) {
  if (!config) return null;
  async function ready(q = db) {
    return !!(await q.query(`SELECT 1 FROM community_chat.channels c
      JOIN community_chat.channels l ON l.id='lobby'
      WHERE c.id=$1 AND c.platform='forum' AND c.remote_id='2' AND c.connected AND c.can_post
      AND c.visibility='workspace' AND l.platform='ootle' AND l.visibility='workspace' AND l.can_post`, [FORUM_DESTINATION])).rows[0];
  }
  return {
    async status() { return await ready() ? { channelId: "lobby", url: FORUM_CHANNEL_URL, destinationId: FORUM_DESTINATION } : null; },
    authorizeCron(header) { return equal(header, `Bearer ${config.cronSecret}`); },
    async enqueue(q, message) {
      if (message.channel_id !== "lobby" || message.platform !== "ootle" || Date.parse(message.created_at) < Date.parse(config.startsAt) || !await ready(q)) return;
      await q.query("INSERT INTO community_chat.deliveries(id,message_id,channel_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING", [randomUUID(), message.id, FORUM_DESTINATION]);
    },
    async receive(raw, headers) {
      if (!Buffer.isBuffer(raw)) reject("A signed JSON payload is required.", 400);
      const signature = "sha256=" + createHmac("sha256", config.secret).update(raw).digest("hex");
      if (!equal(headers["x-discourse-event-signature"], signature)) reject("Invalid forum signature.", 401);
      if (headers["x-discourse-instance"] !== FORUM_ORIGIN) reject("Unexpected forum instance.", 403);
      let payload;
      try { payload = JSON.parse(raw); } catch { reject("Invalid forum payload."); }
      const { message: m, channel: c } = payload;
      // Strict allowlist: no DMs, private categories, other channels or pre-activation history.
      if (!m || !c || c.id !== 2 || m.chat_channel_id !== 2 || c.chatable_type !== "Category" || c.chatable_id !== 4 || c.chatable?.read_restricted !== false) return { ignored: true };
      if (!numericId(m.id) || !Number.isFinite(Date.parse(m.created_at))) reject("Invalid forum message.");
      if (Date.parse(m.created_at) < Math.max(Date.parse(config.startsAt), Date.now() - 90 * 86400_000)) return { ignored: true };
      if (!await ready()) reject("Forum bridge is paused.", 503);
      const event = headers["x-discourse-event"];
      if (!["chat_message_created", "chat_message_edited", "chat_message_trashed", "chat_message_restored"].includes(event)) return { ignored: true };
      if (!numericId(headers["x-discourse-event-id"])) reject("Invalid forum event id.");
      const remoteId = String(m.id), url = `${FORUM_CHANNEL_URL}/${remoteId}`;
      return db.transaction(async q => {
        // Deduplicate provider retries durably; event rows contain no chat content.
        const seen = await q.query("INSERT INTO community_chat.forum_events(digest) VALUES($1) ON CONFLICT DO NOTHING RETURNING digest", [digest(`${headers["x-discourse-event-id"]}:${event}:${raw.toString("utf8")}`)]);
        if (!seen.rows.length) return { duplicate: true };
        // Incoming-hook copies carry Discourse's webhook metadata and our exact payload marker.
        // Never treat a matching string posted by an ordinary forum member as a receipt.
        if (m.chat_webhook_event) {
          const marker = /<!-- tari-lobby:([a-f0-9-]{36}) -->$/.exec(m.message || "");
          if (marker) {
            const original = (await q.query(`SELECT m.*,p.author_name AS parent_author FROM community_chat.messages m LEFT JOIN community_chat.messages p ON p.id=m.parent_id WHERE m.id=$1 AND m.platform='ootle' AND m.channel_id='lobby'`, [marker[1]])).rows[0];
            if (original && forumPost(original) === m.message)
              await q.query("UPDATE community_chat.deliveries SET status='delivered',remote_id=$2,receipt_url=$3,error=NULL,updated_at=now() WHERE message_id=$1 AND channel_id=$4 AND status IN ('sending','uncertain','delivered')", [original.id, remoteId, url, FORUM_DESTINATION]);
          }
          return { ignored: true };
        }
        if (m.is_action) return { ignored: true };
        const body = clean(m.message, 3800) || (m.uploads?.length ? "[Attachment — open the original on Forum]" : "[Message removed on Forum]");
        const suffix = (m.message?.length > 3800 || m.uploads?.length) ? `\n\nOriginal on Forum: ${url}` : "";
        const deleted = !!m.deleted_at || event === "chat_message_trashed";
        const parentRemote = numericId(m.in_reply_to?.id) ? String(m.in_reply_to.id) : null;
        const parent = parentRemote ? (await q.query(`SELECT id FROM community_chat.messages WHERE channel_id='lobby' AND platform='forum' AND remote_id=$1
          UNION ALL SELECT message_id AS id FROM community_chat.deliveries WHERE channel_id=$2 AND remote_id=$1 LIMIT 1`, [parentRemote, FORUM_DESTINATION])).rows[0]?.id : null;
        // A local moderator's hidden_at is independent of source deletion/restoration.
        await q.query(`INSERT INTO community_chat.messages(id,channel_id,author_name,body,parent_id,platform,remote_id,origin_url,created_at,source_hidden,source_event_id)
          VALUES($1,'lobby',$2,$3,$4,'forum',$5,$6,$7,$8,$9)
          ON CONFLICT(channel_id,platform,remote_id) DO UPDATE SET body=EXCLUDED.body,author_name=EXCLUDED.author_name,
          source_hidden=EXCLUDED.source_hidden,source_event_id=EXCLUDED.source_event_id
          WHERE community_chat.messages.source_event_id<EXCLUDED.source_event_id`,
          [randomUUID(), clean(m.user?.username, 40) || "Forum member", body + suffix, parent || null, remoteId, url, m.created_at, deleted, headers["x-discourse-event-id"]]);
        return { received: true };
      });
    },
    async flush({ limit = 10 } = {}) {
      if (!await ready()) return { paused: true };
      // A killed server may have sent the request; never resend these automatically.
      await db.query("UPDATE community_chat.deliveries SET status='uncertain',error='Confirmation pending; check Forum before retrying.',updated_at=now() WHERE channel_id=$1 AND status='sending' AND updated_at<now()-interval '2 minutes'", [FORUM_DESTINATION]);
      let processed = 0;
      const deadline = Date.now() + 35000;
      while (processed < Math.min(limit, 10) && Date.now() < deadline) {
        const delivery = await db.transaction(async q => {
          if (!await ready(q)) return null;
          const row = (await q.query(`SELECT d.id AS delivery_id,m.*,p.author_name AS parent_author FROM community_chat.deliveries d
            JOIN community_chat.messages m ON m.id=d.message_id LEFT JOIN community_chat.messages p ON p.id=m.parent_id
            WHERE d.channel_id=$1 AND d.status='queued' AND d.next_attempt_at<=now()
            AND m.platform='ootle' AND m.channel_id='lobby' AND m.hidden_at IS NULL
            ORDER BY d.updated_at FOR UPDATE OF d SKIP LOCKED LIMIT 1`, [FORUM_DESTINATION])).rows[0];
          if (row) await q.query("UPDATE community_chat.deliveries SET status='sending',updated_at=now() WHERE id=$1", [row.delivery_id]);
          return row;
        });
        if (!delivery) break;
        processed++;
        let status = "uncertain", error = "Confirmation pending; check Forum before retrying.", retry = false;
        try {
          const response = await fetcher(config.incomingUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: forumPost(delivery) }), redirect: "error", signal: AbortSignal.timeout(8000) });
          if (response.ok && (await response.json()).success === "OK") { status = "delivered"; error = null; }
          else if (response.status === 429) { status = "queued"; error = "Forum rate limit; queued for retry."; retry = true; }
          else if (response.status >= 400 && response.status < 500) { status = "failed"; error = `Forum rejected this message (${response.status}).`; }
        } catch { /* Do not log webhook URLs, message bodies, credentials or provider error pages. */ }
        await db.query(`UPDATE community_chat.deliveries SET status=$2,error=$3,receipt_url=CASE WHEN $2='delivered' THEN $4 ELSE receipt_url END,
          next_attempt_at=now()+interval '65 seconds',updated_at=now() WHERE id=$1 AND status='sending'`, [delivery.delivery_id, status, error, FORUM_CHANNEL_URL]);
        if (retry) break;
      }
      return { processed };
    },
  };
}
