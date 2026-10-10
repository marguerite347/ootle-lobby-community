import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { resolve, isAbsolute, sep } from "node:path";
import { Pool } from "pg";
import { communityDatabaseOptions } from "../creator-hub/hub/server/community/database.mjs";
import {
  createChatStore,
  installSchema,
} from "../creator-hub/hub/server/community/store.mjs";
const command = process.argv[2];
if (!["install", "retention", "invite"].includes(command))
  throw new Error("Usage: node scripts/manage-community.mjs install|retention|invite [name] [member|owner] [private-output-file]");
if (!process.env.CHAT_DATABASE_URL)
  throw new Error(
    "CHAT_DATABASE_URL must identify the operator-approved chat database.",
  );
const pool = new Pool({
  ...communityDatabaseOptions(),
  max: 1,
});
const db = {
  query: (...args) => pool.query(...args),
  exec: (sql) => pool.query(sql),
};
try {
  if (command === "install") await installSchema(db);
  else if (command === "invite") {
    const [name, role, output] = process.argv.slice(3);
    const root = resolve(new URL("..", import.meta.url).pathname);
    if (!output || !isAbsolute(output) || resolve(output).startsWith(root + sep)) throw new Error("Save invitations to an absolute private path outside the repository.");
    if (!["member", "owner"].includes(role)) throw new Error("Choose member or owner.");
    const token = randomBytes(32).toString("hex"), expiresAt = new Date(Date.now() + 7 * 86400_000).toISOString();
    await createChatStore(db).createInvitation({token, name, role, expiresAt});
    writeFileSync(output, JSON.stringify({name, role, expiresAt, token, url: process.env.CHAT_PUBLIC_ORIGIN + "/?chat=open#invite=" + token}, null, 2), {mode: 0o600, flag: "wx"});
  } else await createChatStore(db).retention();
  console.log("Community " + command + " completed.");
} finally {
  await pool.end();
}
