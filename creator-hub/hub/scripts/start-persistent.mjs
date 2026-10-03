import path from "node:path";
import { existsSync } from "node:fs";

// No personal-machine fallback: operators must provision cloud storage explicitly.
const root = process.env.CREATOR_HUB_DATA_DIR;
if (process.platform !== "linux" || !root || !path.isAbsolute(root) || !existsSync(root)) {
  throw new Error("Persistent hosting requires Linux and an existing absolute CREATOR_HUB_DATA_DIR on provisioned cloud storage. See deploy/digitalocean/README.md. Local development must use disposable fixtures; existing local data is migration-only.");
}
console.log("Explicit persistent storage:", root);
await import("../server/index.mjs");
