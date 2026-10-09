// INTEGRATION_GAP[LOBBY-CHAT] (build-required): see docs/DEVELOPMENT_GAPS.md#lobby-chat.
import { randomUUID, createHash } from "node:crypto";
import { readFileSync } from "node:fs";
export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");
export function reject(message, status = 400) {
  throw Object.assign(new Error(message), { status, expose: true });
}
const text = (value, max = 4000) =>
  typeof value === "string"
    ? value
        .replace(
          /[\u0000-\u0008\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,
          "",
        )
        .trim()
        .slice(0, max + 1)
    : "";
const idPattern = /^[A-Za-z0-9_-]{1,100}$/;
const accessSql = `(c.visibility='workspace' OR EXISTS(SELECT 1 FROM community_chat.channel_members cm WHERE cm.channel_id=c.id AND cm.account_id=$1))`;
const moderator = (actor) => ["owner", "moderator"].includes(actor.role);
export async function installSchema(db) {
  await db.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
}

/** db: parameterized query + transaction(callback). No shared mutable request identity. */
export function createChatStore(db) {
  async function actor(q, id, lock = false) {
    const result = await q.query(
      `SELECT * FROM community_chat.accounts WHERE id=$1 ${lock ? "FOR UPDATE" : ""}`,
      [id],
    );
    const account = result.rows[0];
    if (!account || account.blocked)
      reject("Sign in with an active community account.", 401);
    return account;
  }
  async function channel(q, userId, id) {
    if (!idPattern.test(id)) reject("Conversation not found.", 404);
    const result = await q.query(
      `SELECT c.* FROM community_chat.channels c WHERE c.id=$2 AND ${accessSql}`,
      [userId, id],
    );
    if (!result.rows[0]) reject("Conversation not found.", 404);
    return result.rows[0];
  }
  const publicAccount = (account) => ({
    id: account.id,
    name: account.name,
    role: account.role,
  });
  return {
    async rateLimit(key, limit = 20) {
      const { rows } = await db.query(
        `INSERT INTO community_chat.rate_limits(key,window_at,count) VALUES($1,now(),1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN community_chat.rate_limits.window_at<now()-interval '10 minutes' THEN 1 ELSE community_chat.rate_limits.count+1 END,window_at=CASE WHEN community_chat.rate_limits.window_at<now()-interval '10 minutes' THEN now() ELSE community_chat.rate_limits.window_at END RETURNING count`,
        [key],
      );
      if (rows[0].count > limit)
        reject("Too many attempts. Try again in a few minutes.", 429);
    },
    async account(userId) {
      return publicAccount(await actor(db, userId));
    },
    async login(
      identity,
      { ownerId, allowedIds = [], openEnrollment = false } = {},
    ) {
      if (!/^\d+$/.test(String(identity.id)) || !identity.login)
        reject("The sign-in provider returned an invalid identity.", 401);
      const providerId = String(identity.id);
      if (
        !openEnrollment &&
        providerId !== ownerId &&
        !allowedIds.includes(providerId)
      )
        reject("This community is invite-only. Ask its owner for access.", 403);
      const id = "github-" + providerId;
      const role = providerId === ownerId ? "owner" : "member";
      await db.query(
        `INSERT INTO community_chat.accounts(id,provider_id,name,role) VALUES($1,$2,$3,$4) ON CONFLICT(provider_id) DO UPDATE SET name=EXCLUDED.name`,
        [id, String(identity.id), text(identity.login, 40), role],
      );
      return publicAccount(await actor(db, id));
    },
    async session(token) {
      if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token))
        return null;
      const { rows } = await db.query(
        `SELECT a.id,a.name,a.role FROM community_chat.sessions s JOIN community_chat.accounts a ON a.id=s.account_id WHERE s.digest=$1 AND s.expires_at>now() AND NOT a.blocked`,
        [digest(token)],
      );
      return rows[0] || null;
    },
    async createSession(userId, token) {
      await actor(db, userId);
      await db.query(
        `INSERT INTO community_chat.sessions(digest,account_id,expires_at) VALUES($1,$2,now()+interval '7 days')`,
        [digest(token), userId],
      );
    },
    async logout(token) {
      if (token)
        await db.query("DELETE FROM community_chat.sessions WHERE digest=$1", [
          digest(token),
        ]);
    },
    async startLogin(state, verifier) {
      await db.query(
        `INSERT INTO community_chat.login_states(digest,verifier,expires_at) VALUES($1,$2,now()+interval '10 minutes')`,
        [digest(state), verifier],
      );
    },
    async consumeLogin(state) {
      const { rows } = await db.query(
        "DELETE FROM community_chat.login_states WHERE digest=$1 AND expires_at>now() RETURNING verifier",
        [digest(state)],
      );
      return rows[0]?.verifier;
    },
    async channels(userId) {
      await actor(db, userId);
      return (
        await db.query(
          `SELECT c.*, (SELECT max(m.created_at) FROM community_chat.messages m WHERE m.channel_id=c.id AND m.hidden_at IS NULL) AS latest_at FROM community_chat.channels c WHERE ${accessSql} ORDER BY c.platform,c.name`,
          [userId],
        )
      ).rows;
    },
    async messages(userId, channelId, { before, search = "" } = {}) {
      await actor(db, userId);
      await channel(db, userId, channelId);
      if (before && Number.isNaN(Date.parse(before)))
        reject("Invalid message cursor.");
      const result = await db.query(
        `SELECT m.*, (SELECT count(*)::int FROM community_chat.messages replies WHERE replies.parent_id=m.id AND replies.hidden_at IS NULL) AS reply_count, COALESCE((SELECT json_agg(json_build_object('id',d.id,'channel_id',d.channel_id,'status',d.status,'receipt_url',d.receipt_url,'error',d.error)) FROM community_chat.deliveries d JOIN community_chat.channels c ON c.id=d.channel_id WHERE d.message_id=m.id AND (c.visibility='workspace' OR EXISTS(SELECT 1 FROM community_chat.channel_members cm WHERE cm.channel_id=c.id AND cm.account_id=$4))),'[]'::json) AS deliveries FROM community_chat.messages m WHERE m.channel_id=$1 AND m.hidden_at IS NULL AND ($2::timestamptz IS NULL OR m.created_at<$2) AND ($3='' OR strpos(lower(m.body),lower($3))>0) ORDER BY m.created_at DESC,m.id DESC LIMIT 100`,
        [channelId, before || null, text(search, 100), userId],
      );
      return result.rows.reverse();
    },
    async send(userId, input) {
      const body = text(input.body),
        clientId = String(input.clientId || "");
      if (!body || body.length > 4000)
        reject("Write a message of 1–4,000 characters.");
      if (!/^[a-zA-Z0-9_-]{8,100}$/.test(clientId))
        reject("A message id is required.");
      if (!Array.isArray(input.destinations || []))
        reject("Choose valid destinations.");
      const destinations = [...new Set(input.destinations || [])];
      if (
        destinations.length > 5 ||
        destinations.some((id) => typeof id !== "string")
      )
        reject("Choose up to five destinations.");
      return db.transaction(async (q) => {
        const account = await actor(q, userId, true),
          source = await channel(q, userId, input.channelId);
        if (source.platform !== "ootle" || !source.can_post)
          reject("This conversation does not accept native posts.", 403);
        const { rows: existing } = await q.query(
          "SELECT * FROM community_chat.messages WHERE account_id=$1 AND client_id=$2",
          [userId, clientId],
        );
        if (existing[0]) {
          const prior = existing[0];
          const targetIds = (
            await q.query(
              "SELECT channel_id FROM community_chat.deliveries WHERE message_id=$1",
              [prior.id],
            )
          ).rows
            .map((r) => r.channel_id)
            .sort();
          if (
            prior.body !== body ||
            prior.channel_id !== input.channelId ||
            (prior.parent_id || null) !== (input.parentId || null) ||
            JSON.stringify(targetIds) !==
              JSON.stringify(destinations.slice().sort())
          )
            reject(
              "This message id was already used for a different draft.",
              409,
            );
          return prior;
        }
        if (input.parentId) {
          const { rows } = await q.query(
            "SELECT id FROM community_chat.messages WHERE id=$1 AND channel_id=$2 AND hidden_at IS NULL",
            [input.parentId, source.id],
          );
          if (!rows.length)
            reject("The message you are replying to is unavailable.", 409);
        }
        if (destinations.length && !moderator(account))
          reject("Only approved publishers can cross-post.", 403);
        if (destinations.length && input.confirmed !== true)
          reject("Review the destinations before posting.");
        for (const destination of destinations) {
          const target = await channel(q, userId, destination);
          if (
            target.platform === "ootle" ||
            !target.connected ||
            !target.can_post
          )
            reject(
              "One of these destinations is not connected for posting.",
              409,
            );
        }
        const { rows: quota } = await q.query(
          `UPDATE community_chat.accounts SET quota_count=CASE WHEN quota_at<now()-interval '1 minute' THEN 1 ELSE quota_count+1 END, quota_at=CASE WHEN quota_at<now()-interval '1 minute' THEN now() ELSE quota_at END WHERE id=$1 RETURNING quota_count`,
          [userId],
        );
        if (quota[0].quota_count > 10)
          reject("You are sending quickly. Try again in a minute.", 429);
        const id = randomUUID();
        const { rows } = await q.query(
          "INSERT INTO community_chat.messages(id,channel_id,account_id,author_name,body,parent_id,client_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
          [
            id,
            source.id,
            userId,
            account.name,
            body,
            input.parentId || null,
            clientId,
          ],
        );
        for (const destination of destinations)
          await q.query(
            "INSERT INTO community_chat.deliveries(id,message_id,channel_id) VALUES($1,$2,$3)",
            [randomUUID(), id, destination],
          );
        return rows[0];
      });
    },
    async report(userId, messageId, reason) {
      await actor(db, userId);
      const message = (
        await db.query(
          "SELECT channel_id FROM community_chat.messages WHERE id=$1 AND hidden_at IS NULL",
          [messageId],
        )
      ).rows[0];
      if (!message) reject("Message not found.", 404);
      await channel(db, userId, message.channel_id);
      const cleaned = text(reason, 500);
      if (!cleaned || cleaned.length > 500)
        reject("Add a short reason for the report.");
      await db.query(
        "INSERT INTO community_chat.reports(id,message_id,account_id,reason) VALUES($1,$2,$3,$4) ON CONFLICT(message_id,account_id) DO NOTHING",
        [randomUUID(), messageId, userId, cleaned],
      );
    },
    async moderate(userId, messageId, action) {
      if (!["hide", "restore"].includes(action))
        reject("Choose hide or restore.");
      return db.transaction(async (q) => {
        if (!moderator(await actor(q, userId, true)))
          reject("Moderator access required.", 403);
        const { rows } = await q.query(
          "SELECT channel_id FROM community_chat.messages WHERE id=$1",
          [messageId],
        );
        if (!rows[0]) reject("Message not found.", 404);
        await channel(q, userId, rows[0].channel_id);
        await q.query(
          `UPDATE community_chat.messages SET hidden_at=${action === "hide" ? "now()" : "NULL"} WHERE id=$1`,
          [messageId],
        );
        await q.query(
          "INSERT INTO community_chat.audit(id,account_id,action,subject_id) VALUES($1,$2,$3,$4)",
          [randomUUID(), userId, action, messageId],
        );
      });
    },
    async reports(userId) {
      if (!moderator(await actor(db, userId)))
        reject("Moderator access required.", 403);
      return (
        await db.query(
          `SELECT r.id,r.reason,r.created_at,m.id AS message_id,m.body,m.author_name,m.hidden_at FROM community_chat.reports r JOIN community_chat.messages m ON m.id=r.message_id JOIN community_chat.channels c ON c.id=m.channel_id WHERE ${accessSql} ORDER BY r.created_at DESC LIMIT 100`,
          [userId],
        )
      ).rows;
    },
    async retention() {
      // Operator-only maintenance: preserve thread roots while replies remain.
      await db.query(
        "DELETE FROM community_chat.sessions WHERE expires_at<now()",
      );
      await db.query(
        "DELETE FROM community_chat.login_states WHERE expires_at<now()",
      );
      await db.query(
        "DELETE FROM community_chat.rate_limits WHERE window_at<now()-interval '1 day'",
      );
      await db.query(
        `DELETE FROM community_chat.messages m WHERE m.created_at<now()-interval '90 days' AND NOT EXISTS(SELECT 1 FROM community_chat.messages r WHERE r.parent_id=m.id)`,
      );
      await db.query(
        `UPDATE community_chat.messages SET body='[Message expired]',account_id=NULL,author_name='Expired',origin_url=NULL WHERE created_at<now()-interval '90 days'`,
      );
      await db.query(
        `DELETE FROM community_chat.audit WHERE created_at<now()-interval '180 days'`,
      );
    },
  };
}
