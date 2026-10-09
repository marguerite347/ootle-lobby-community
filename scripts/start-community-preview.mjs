// A local, clearly labeled review environment. Never load this in a deployment.
import { PGlite } from "@electric-sql/pglite";
import express from "express";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  createChatStore,
  installSchema,
} from "../creator-hub/hub/server/community/store.mjs";
import { createCommunityRouter } from "../creator-hub/hub/server/community/router.mjs";
import {
  securityHeaders,
  localHostGuard,
} from "../creator-hub/hub/server/publicSecurity.mjs";
if (process.env.VERCEL) throw new Error("This preview cannot run on Vercel.");
const port = Number(process.env.PORT || 4318),
  origin = "http://127.0.0.1:" + port;
const directory = resolve(
  process.env.CHAT_PREVIEW_DIR || "work/community-preview",
);
mkdirSync(directory, { recursive: true });
const db = new PGlite(directory);
await installSchema(db);
const store = createChatStore(db);
await store.login({ id: 1, login: "You" }, { ownerId: "1" });
await store.login({ id: 2, login: "Ari" }, { allowedIds: ["2"] });
await store.login({ id: 3, login: "Mika" }, { allowedIds: ["3"] });
for (const [userId, channelId, body, clientId] of [
  [
    "github-2",
    "lobby",
    "Welcome to the conversation. What are you working on this week?",
    "preview-seed-0001",
  ],
  [
    "github-3",
    "lobby",
    "A tiny co-op game where the lights only work when you stay together. First playable is finally ready.",
    "preview-seed-0002",
  ],
  [
    "github-2",
    "lobby",
    "That sounds great. Drop it in show-and-tell when you are ready for another pair of eyes.",
    "preview-seed-0003",
  ],
  [
    "github-2",
    "builders",
    "What is one thing you wish you knew before shipping your first build?",
    "preview-seed-0004",
  ],
  [
    "github-3",
    "show-and-tell",
    "Use this space for a first playable, a work in progress, or a small win.",
    "preview-seed-0005",
  ],
])
  await store.send(userId, { channelId, body, clientId });
const app = express();
app.disable("x-powered-by");
app.use(securityHeaders, localHostGuard);
app.use("/api/chat", createCommunityRouter({ store, origin, preview: true }));
app.use(express.static("creator-hub/hub/client/dist"));
app.get("*", (_req, res) =>
  res.sendFile(resolve("creator-hub/hub/client/dist/index.html")),
);
const server = app.listen(port, "127.0.0.1", () =>
  console.log("Community preview: " + origin + "/chat"),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.closeAllConnections();
    server.close(async () => {
      await db.close();
      process.exit();
    });
  });
