// INTEGRATION_GAP[LOBBY-CHAT] (build-required): automatic guest identities support native chat and editable names; external transports remain unconnected. See docs/DEVELOPMENT_GAPS.md#lobby-chat.
import { Router, json } from "express";
import {
  randomBytes,
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { publicError } from "../publicSecurity.mjs";
import { reject } from "./store.mjs";
const cookieName = "ootle_chat_session";
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);
function cookies(req) {
  return Object.fromEntries(
    (req.get("cookie") || "").split(";").map((item) => item.trim().split("=")),
  );
}
const equal = (a, b) =>
  typeof a === "string" &&
  typeof b === "string" &&
  Buffer.byteLength(a) === Buffer.byteLength(b) &&
  timingSafeEqual(Buffer.from(a), Buffer.from(b));
export function createCommunityRouter({
  store,
  origin,
  oauth,
  invites,
  guests,
  preview = false,
  previewAccount = "github-1",
  fetcher = fetch,
} = {}) {
  const router = Router(),
    configured = !!store;
  const safeOrigin = origin ? new URL(origin).origin : null;
  if (
    preview &&
    (process.env.VERCEL ||
      !["localhost", "127.0.0.1"].includes(new URL(origin).hostname))
  )
    throw new Error("Preview chat is loopback-only.");
  const cookieOptions = {
    httpOnly: true,
    secure: !preview,
    sameSite: "lax",
    path: "/api/chat",
    maxAge: 7 * 86400_000,
  };
  const clearCookieOptions = {
    httpOnly: true,
    secure: !preview,
    sameSite: "lax",
    path: "/api/chat",
  };
  router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (/%|\\|\/\//.test(req.path))
      return res.status(400).json({ error: "Invalid chat path." });
    if (
      preview &&
      !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
        req.socket.remoteAddress,
      )
    )
      return res.status(403).json({ error: "Local preview only." });
    next();
  });
  router.get("/capabilities", (_req, res) =>
    res.json({
      configured,
      preview,
      signIn: configured && !!oauth?.clientId,
      invitations: configured && !!invites?.secret,
      guests: configured && !!guests?.secret,
      platforms: ["telegram", "discord", "slack"],
      externalConnected: false,
    }),
  );
  router.use((req, res, next) =>
    configured
      ? next()
      : res.status(503).json({
          error: "Community chat is being connected. Please check back soon.",
          code: "CHAT_NOT_CONFIGURED",
        }),
  );
  // Mutations need both an exact origin and an explicit custom header. No CORS.
  router.use((req, res, next) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      (req.get("origin") !== safeOrigin || req.get("x-ootle-chat") !== "1")
    )
      return res
        .status(403)
        .json({ error: "Open chat on its own site before posting." });
    next();
  });
  router.use(json({ limit: "16kb", strict: true }));
  router.get(
    "/session",
    wrap(async (req, res) =>
      res.json({
        account: await store.session(cookies(req)[cookieName]),
        preview,
      }),
    ),
  );
  router.post(
    "/logout",
    wrap(async (req, res) => {
      await store.logout(cookies(req)[cookieName]);
      res.clearCookie(cookieName, clearCookieOptions);
      res.json({ ok: true });
    }),
  );
  if (preview)
    router.post(
      "/preview/session",
      wrap(async (_req, res) => {
        const token = randomBytes(32).toString("hex");
        await store.createSession(previewAccount, token);
        res.cookie(cookieName, token, cookieOptions);
        res.json({ account: await store.account(previewAccount) });
      }),
    );
  if (guests?.secret)
    router.post(
      "/guest/session",
      wrap(async (req, res) => {
        const current = await store.session(cookies(req)[cookieName]);
        if (current) return res.json({ account: current });
        await store.rateLimit(
          "guest:" + createHmac("sha256", guests.secret).update(req.ip || "unknown").digest("hex"),
          10,
        );
        const token = randomBytes(32).toString("hex");
        const account = await store.createGuest(req.body.name, token);
        res.cookie(cookieName, token, cookieOptions);
        res.json({ account });
      }),
    );
  if (invites?.secret)
    router.post(
      "/invitations/redeem",
      wrap(async (req, res) => {
        await store.rateLimit("invite:" + createHmac("sha256", invites.secret).update(req.ip || "unknown").digest("hex"));
        const token = randomBytes(32).toString("hex");
        const account = await store.redeemInvitation(req.body.token, req.body.name, token);
        res.cookie(cookieName, token, cookieOptions);
        res.json({ account });
      }),
    );
  router.get(
    "/auth/start",
    wrap(async (req, res) => {
      if (!oauth?.clientId || !oauth.clientSecret || !safeOrigin)
        reject("Sign-in is not connected yet.", 503);
      await store.rateLimit(
        "login:" +
          createHmac("sha256", oauth.clientSecret)
            .update(req.ip || "unknown")
            .digest("hex"),
      );
      const state = randomBytes(32).toString("hex"),
        verifier = randomBytes(32).toString("base64url");
      await store.startLogin(state, verifier);
      res.cookie("ootle_chat_oauth", state, {
        ...cookieOptions,
        maxAge: 600_000,
      });
      res.cookie(
        "ootle_chat_return",
        req.query.returnTo === "lobby" ? "lobby" : "chat",
        {
          ...cookieOptions,
          maxAge: 600_000,
        },
      );
      const params = new URLSearchParams({
        client_id: oauth.clientId,
        redirect_uri: safeOrigin + "/api/chat/auth/callback",
        state,
        scope: "",
        code_challenge: createHash("sha256")
          .update(verifier)
          .digest("base64url"),
        code_challenge_method: "S256",
      });
      res.redirect("https://github.com/login/oauth/authorize?" + params);
    }),
  );
  router.get(
    "/auth/callback",
    wrap(async (req, res) => {
      const state = req.query.state,
        code = req.query.code;
      if (
        !oauth?.clientId ||
        typeof state !== "string" ||
        typeof code !== "string" ||
        !equal(state, cookies(req).ootle_chat_oauth)
      )
        reject("Sign-in expired. Please start again.", 400);
      const verifier = await store.consumeLogin(state);
      if (!verifier) reject("Sign-in expired. Please start again.", 400);
      res.clearCookie("ootle_chat_oauth", clearCookieOptions);
      const tokenResponse = await fetcher(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: oauth.clientId,
            client_secret: oauth.clientSecret,
            code,
            code_verifier: verifier,
            redirect_uri: safeOrigin + "/api/chat/auth/callback",
          }),
          signal: AbortSignal.timeout(15000),
        },
      );
      const token = await tokenResponse.json();
      if (!tokenResponse.ok || !token.access_token)
        reject("Sign-in could not be completed.", 401);
      const identityResponse = await fetcher("https://api.github.com/user", {
        headers: {
          Authorization: "Bearer " + token.access_token,
          Accept: "application/vnd.github+json",
          "User-Agent": "Ootle-Community",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!identityResponse.ok) reject("Could not verify this account.", 401);
      const account = await store.login(await identityResponse.json(), oauth);
      const session = randomBytes(32).toString("hex");
      await store.createSession(account.id, session);
      res.cookie(cookieName, session, cookieOptions);
      const returnToLobby = cookies(req).ootle_chat_return === "lobby";
      res.clearCookie("ootle_chat_return", clearCookieOptions);
      res.redirect(returnToLobby ? "/?chat=open" : "/chat");
    }),
  );
  router.use((req, res, next) =>
    store.session(cookies(req)[cookieName]).then((account) => {
      if (!account)
        return res
          .status(401)
          .json({ error: "Join the conversation to continue." });
      req.chatAccount = account;
      next();
    }, next),
  );
  router.post(
    "/profile/name",
    wrap(async (req, res) => {
      await store.rateLimit("name:" + req.chatAccount.id, 20);
      const account = await store.renameAccount(
        req.chatAccount.id,
        req.body.randomize === true ? undefined : req.body.name,
      );
      res.json({ account });
    }),
  );
  router.get(
    "/channels",
    wrap(async (req, res) =>
      res.json({ channels: await store.channels(req.chatAccount.id) }),
    ),
  );
  router.get(
    "/channels/:id/messages",
    wrap(async (req, res) =>
      res.json({
        messages: await store.messages(req.chatAccount.id, req.params.id, {
          before: req.query.before,
          search: req.query.q,
        }),
      }),
    ),
  );
  router.post(
    "/messages",
    wrap(async (req, res) => {
      if (req.body.destinations?.length)
        reject(
          "Cross-app posting is not connected yet. Your draft is still here.",
          409,
        );
      res
        .status(201)
        .json({ message: await store.send(req.chatAccount.id, req.body) });
    }),
  );
  router.post(
    "/messages/:id/report",
    wrap(async (req, res) => {
      await store.rateLimit("reports:" + req.chatAccount.id, 10);
      await store.report(req.chatAccount.id, req.params.id, req.body.reason);
      res.json({ ok: true });
    }),
  );
  router.get(
    "/moderation",
    wrap(async (req, res) =>
      res.json({ reports: await store.reports(req.chatAccount.id) }),
    ),
  );
  router.post(
    "/messages/:id/moderate",
    wrap(async (req, res) => {
      await store.moderate(req.chatAccount.id, req.params.id, req.body.action);
      res.json({ ok: true });
    }),
  );
  router.use((_req, res) =>
    res.status(404).json({ error: "Unknown chat endpoint." }),
  );
  router.use((error, _req, res, _next) => {
    const response = publicError(error);
    res.status(response.status).json(response.body);
  });
  return router;
}
