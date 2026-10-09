import { Pool } from "pg";
import { communityDatabaseOptions } from "../creator-hub/hub/server/community/database.mjs";
import {
  createChatStore,
  installSchema,
} from "../creator-hub/hub/server/community/store.mjs";
const command = process.argv[2];
if (!["install", "retention"].includes(command))
  throw new Error("Usage: node scripts/manage-community.mjs install|retention");
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
  else await createChatStore(db).retention();
  console.log("Community " + command + " completed.");
} finally {
  await pool.end();
}
