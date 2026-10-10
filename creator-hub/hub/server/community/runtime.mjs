import { Pool } from "pg";
import { createChatStore } from "./store.mjs";
import { communityDatabaseOptions } from "./database.mjs";
let services;
export function communityServicesFromEnv(env = process.env) {
  if (env.CHAT_ENABLED !== "1") return {};
  if (services) return services;
  for (const name of [
    "CHAT_DATABASE_URL",
    "CHAT_PUBLIC_ORIGIN",
  ])
    if (!env[name]) throw new Error("Missing chat configuration: " + name);
  const invitations = env.CHAT_INVITES_ENABLED === "1";
  const github = !!env.CHAT_GITHUB_CLIENT_ID;
  if (invitations && !env.CHAT_INVITE_SECRET) throw new Error("Missing chat configuration: CHAT_INVITE_SECRET");
  if (github && (!env.CHAT_GITHUB_CLIENT_SECRET || !env.CHAT_OWNER_GITHUB_ID)) throw new Error("GitHub chat sign-in is incomplete.");
  if (!invitations && !github) throw new Error("Configure chat sign-in or invitations.");
  const origin = new URL(env.CHAT_PUBLIC_ORIGIN);
  if (origin.protocol !== "https:")
    throw new Error("Hosted chat requires HTTPS.");
  const pool = new Pool({
    ...communityDatabaseOptions(env),
    max: 3,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 20000,
  });
  const db = {
    query: (...args) => pool.query(...args),
    exec: (sql) => pool.query(sql),
    transaction: async (fn) => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  };
  services = {
    store: createChatStore(db),
    origin: origin.origin,
    invites: invitations ? { secret: env.CHAT_INVITE_SECRET } : undefined,
    oauth: github ? {
      clientId: env.CHAT_GITHUB_CLIENT_ID,
      clientSecret: env.CHAT_GITHUB_CLIENT_SECRET,
      ownerId: env.CHAT_OWNER_GITHUB_ID,
      allowedIds: (env.CHAT_ALLOWED_GITHUB_IDS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      openEnrollment: env.CHAT_OPEN_ENROLLMENT === "1",
    } : undefined,
  };
  return services;
}
