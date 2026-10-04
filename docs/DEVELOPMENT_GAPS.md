# Lobby and Workbench development gaps

Source review: 2026-10-04. This register covers the public Lobby and Workbench in this repository. It records source-level integration boundaries, not a claim that external credentials, provider accounts or backend services were tested. No runtime records or credentials are included.

Search the code for `INTEGRATION_GAP[` to find the corresponding flags. Each item states what works now, what remains, the source files, and a completion check. **build-required** needs implementation; **configuration-required** already has an adapter but needs owner setup/verification; **local-only** and **design-only** are intentional current limits; **retired** must not be restored as a shortcut. These are developer annotations, not extra copy in the user interface.

Edit [integration-gaps.json](integration-gaps.json) and the matching source comments, then run `node scripts/check-development-gaps.mjs --write`. `npm run validate` checks marker registration and this generated document. That catches missing/stale references, not the semantic completeness of future endpoint implementations. Add/update the register whenever an integration changes; close a gap only with evidence of the completion check.

Workbench request/response contracts: [WORKBENCH.md](WORKBENCH.md). Existing submissions/capture workflow: [COMMUNITY_WORKFLOW.md](COMMUNITY_WORKFLOW.md).

## Review coverage

Reviewed route registration in `server/app.mjs`, the public `inspirationLobby.mjs` guard, `workbench.mjs`, nested daily-trivia/growth routers, Vercel/local entry points, and their storage/provider modules. Reviewed the current client routes, rewards/wallet/agent placeholders, export-only tools, and scheduled October workflow.

Existing catalog/search/resources/collections/onboarding/learn/skills/agent-document routes, launch/journal content, community-content and contest-metrics readers, toolkit generation and health/static routes have implemented read/validation paths. They are not marked missing merely because an upstream request can fail. Hugging Face search is a real read-only adapter; this review does not certify uptime. Historical content and seed media remain reviewed static content. Existing GitHub Pages publication is separate from the missing Workbench publication service. Local marketing data stays access restricted. Old project/asset/challenge write handlers are guarded in the public app; see RETIRED-HOSTING.

## Integration checklist

| ID | Classification | Surface |
| --- | --- | --- |
| [WB-RUNNER](#wb-runner) | build-required | POST /api/workbench/runs; GET /api/workbench/runs/:id |
| [WB-DEPLOY](#wb-deploy) | build-required | POST /api/workbench/deployments |
| [WB-AI](#wb-ai) | build-required | POST /api/workbench/assistant |
| [WB-PUBLISH](#wb-publish) | build-required | POST /api/workbench/publications |
| [WB-FEED](#wb-feed) | build-required | GET /api/workbench/publications; Community Projects and October galleries |
| [WB-AUTH](#wb-auth) | build-required | Workbench service injection and capabilities |
| [WB-SYNC](#wb-sync) | local-only | Workbench browser workspace storage |
| [LOBBY-CHAT](#lobby-chat) | build-required | /api/community-chat/*; /api/project-chat/*; /api/collective-chat/* |
| [LOBBY-AGENT-BRIDGE](#lobby-agent-bridge) | build-required | Collective chat agent coordination |
| [LOBBY-COMMUNITY-WRITES](#lobby-community-writes) | build-required | /api/engagement/*; /api/creator-profiles/*; /api/skill-market*; /api/learn/resources; /api/learning/lessons*; /api/build-budgets*; /api/creator-analytics* |
| [LOBBY-CHECKOUT](#lobby-checkout) | build-required | POST /api/skill-market/:id/download for priced listings |
| [LOBBY-REWARDS](#lobby-rewards) | local-only | Daily Ritual, AI Sparks balance and rewardPlaytest |
| [LOBBY-WALLET](#lobby-wallet) | design-only | WalletPreview and asset-commerce plans |
| [LOBBY-VIDEO](#lobby-video) | design-only | /api/video/templates/*; capture CLI; /api/studio/recipes |
| [LOBBY-RECIPE-ADAPTER](#lobby-recipe-adapter) | design-only | Recipe composition adapters |
| [CFG-SUBSCRIPTIONS](#cfg-subscriptions) | configuration-required | GET /api/subscriptions/config; POST /api/subscriptions |
| [CFG-AI-DRAFT](#cfg-ai-draft) | configuration-required | POST /api/video/templates/:id/draft |
| [CFG-DATA](#cfg-data) | configuration-required | /api/growth/summary; /api/marketing-calendar; /blog/feed.xml; /blog/sitemap.xml; source refresh |
| [OPS-OCTOBER-CHANNEL](#ops-october-channel) | build-required | Once-daily October monitor notification delivery |
| [OPS-DEPLOY](#ops-deploy) | configuration-required | GitHub main to Vercel deployment |
| [RETIRED-HOSTING](#retired-hosting) | retired | Writes to /api/projects*, /api/assets*, /api/recipes/:id/projects, /api/challenges/submissions |

## WB-RUNNER

**build-required** — POST /api/workbench/runs; GET /api/workbench/runs/:id

**Current:** No compiler or test runner is supplied; requests return 501.

**Remaining:** Implement isolated Rust/WASM compile and test jobs, pinned toolchains, logs, durable job/artifact storage, timeouts and cancellation. Bind jobs/artifacts to authenticated owners.

**Completion check:** Compile the bundled Counter, run its tests, reject invalid code, deny another owner access, survive restart and enforce execution limits.

**Source:** [creator-hub/hub/server/workbench.mjs](../creator-hub/hub/server/workbench.mjs), [creator-hub/hub/client/src/workbench/api.ts](../creator-hub/hub/client/src/workbench/api.ts)

## WB-DEPLOY

**build-required** — POST /api/workbench/deployments

**Current:** No wallet or testnet transaction service is supplied.

**Remaining:** Connect Tari wallet approval and testnet submission/confirmation. Verify artifact ownership and source digest; never accept a client claim of compilation or collect private keys.

**Completion check:** Approve, reject and fail a testnet deployment; verify a real confirmed template independently.

**Source:** [creator-hub/hub/server/workbench.mjs](../creator-hub/hub/server/workbench.mjs), [creator-hub/hub/client/src/workbench/api.ts](../creator-hub/hub/client/src/workbench/api.ts)

## WB-AI

**build-required** — POST /api/workbench/assistant

**Current:** No AI provider is supplied; Send stays disabled.

**Remaining:** Provide authenticated, rate-limited model service, provider disclosure, source-sharing controls, request limits and cancellation.

**Completion check:** Explicit Send reaches the configured provider; failure does not fabricate a reply; source is not uploaded on page load.

**Source:** [creator-hub/hub/server/workbench.mjs](../creator-hub/hub/server/workbench.mjs), [creator-hub/hub/client/src/workbench/api.ts](../creator-hub/hub/client/src/workbench/api.ts)

## WB-PUBLISH

**build-required** — POST /api/workbench/publications

**Current:** Form, local draft and ZIP export work; publishing returns 501.

**Remaining:** Build authenticated ownership, server validation, durable submissions, idempotency and moderation. Validate October official entries/window; community items must have no contest membership. Add review/update/withdrawal policy.

**Completion check:** Retry creates one submission; pending review is not public; rejected input and unauthorized changes fail; approved destination remains exclusive.

**Source:** [creator-hub/hub/server/workbench.mjs](../creator-hub/hub/server/workbench.mjs), [creator-hub/hub/client/src/workbench/PublishPanel.tsx](../creator-hub/hub/client/src/workbench/PublishPanel.tsx), [creator-hub/hub/client/src/workbench/model.ts](../creator-hub/hub/client/src/workbench/model.ts)

## WB-FEED

**build-required** — GET /api/workbench/publications; Community Projects and October galleries

**Current:** Disconnected feed returns an empty list. Existing reviewed October content still works.

**Remaining:** Provide approved durable public records, public-safe projection, stable IDs and pagination when needed. Wire approved publication writes to this same source.

**Completion check:** A published item appears for a second visitor after restart in exactly its selected gallery; drafts/private files never appear.

**Source:** [creator-hub/hub/server/workbench.mjs](../creator-hub/hub/server/workbench.mjs), [creator-hub/hub/client/src/workbench/PublicationGallery.tsx](../creator-hub/hub/client/src/workbench/PublicationGallery.tsx), [creator-hub/hub/client/src/components/OctoberSubmissions.tsx](../creator-hub/hub/client/src/components/OctoberSubmissions.tsx)

## WB-AUTH

**build-required** — Workbench service injection and capabilities

**Current:** Both production and local entry points construct the Lobby without Workbench services. No Workbench account/session backend exists.

**Remaining:** Implement session/auth, ownership, origin/CSRF checks, quotas and rate limits; inject services in both entry points. Advertise only integrations that are usable, including job polling.

**Completion check:** Disconnected mode stays fail-closed; configured services pass owner/CSRF/limit tests through the actual public entry point.

**Source:** [creator-hub/hub/server/inspirationLobby.mjs](../creator-hub/hub/server/inspirationLobby.mjs), [creator-hub/hub/server/workbench.mjs](../creator-hub/hub/server/workbench.mjs), [creator-hub/hub/server/index.mjs](../creator-hub/hub/server/index.mjs), [api/index.mjs](../api/index.mjs)

## WB-SYNC

**local-only** — Workbench browser workspace storage

**Current:** Edits and publication metadata persist only in this browser. ZIP import/export is working.

**Remaining:** If cross-device/account workspaces are required, build an authenticated durable workspace/version API and conflict/recovery behavior. This is separate from public listings.

**Completion check:** Reload retains local edits now; future sync must round-trip across two devices and reject unauthorized access.

**Source:** [creator-hub/hub/client/src/pages/Workbench.tsx](../creator-hub/hub/client/src/pages/Workbench.tsx), [creator-hub/hub/client/src/workbench/model.ts](../creator-hub/hub/client/src/workbench/model.ts)

## LOBBY-CHAT

**build-required** — /api/community-chat/*; /api/project-chat/*; /api/collective-chat/*

**Current:** JSON files under runtimeDir plus process-local rate limits; Vercel runtimeDir is temporary. Client IDs and some author roles are self-declared.

**Remaining:** Use shared durable chat/report storage and atomic operations; server-verified identities/roles, shared abuse limits, retention and moderator authorization. Configure existing COMMUNITY_CHAT_MODERATOR_TOKEN while retaining current moderation behavior.

**Completion check:** Messages/reports persist across deployments/instances; role spoofing and duplicate abuse are rejected; moderation is authorized.

**Source:** [creator-hub/hub/server/communityChat.mjs](../creator-hub/hub/server/communityChat.mjs), [creator-hub/hub/server/projectChat.mjs](../creator-hub/hub/server/projectChat.mjs), [creator-hub/hub/server/collectiveChat.mjs](../creator-hub/hub/server/collectiveChat.mjs), [creator-hub/hub/server/paths.mjs](../creator-hub/hub/server/paths.mjs)

## LOBBY-AGENT-BRIDGE

**build-required** — Collective chat agent coordination

**Current:** The UI explicitly says the live Hub-to-agent bridge is not connected. Chat messages do not execute agent work.

**Remaining:** Define and implement authenticated job dispatch/status and approval boundaries if live agent coordination is enabled.

**Completion check:** A verified agent job can be traced to its approved request and outcome; posting a chat message alone cannot execute code.

**Source:** [creator-hub/hub/client/src/chat/copy.ts](../creator-hub/hub/client/src/chat/copy.ts), [creator-hub/hub/server/collectiveChat.mjs](../creator-hub/hub/server/collectiveChat.mjs)

## LOBBY-COMMUNITY-WRITES

**build-required** — /api/engagement/*; /api/creator-profiles/*; /api/skill-market*; /api/learn/resources; /api/learning/lessons*; /api/build-budgets*; /api/creator-analytics*

**Current:** Handlers exist, but runtime JSON files and local/in-memory state are not durable multi-instance services. Ownership ranges from anonymous IDs to locally stored bearer secrets.

**Remaining:** Migrate enabled writes to shared transactional storage; audit per-action authentication/authorization, privacy, moderation, quotas and retention. Preserve public-safe projections and keep private lesson evidence out of public feeds.

**Completion check:** Concurrent writes survive restart; unauthorized edits and role claims fail; analytics deletion/retention works; lesson evidence is never exposed.

**Source:** [creator-hub/hub/server/engagement.mjs](../creator-hub/hub/server/engagement.mjs), [creator-hub/hub/server/skillMarket.mjs](../creator-hub/hub/server/skillMarket.mjs), [creator-hub/hub/server/communityLearning.mjs](../creator-hub/hub/server/communityLearning.mjs), [creator-hub/hub/server/learningLoop.mjs](../creator-hub/hub/server/learningLoop.mjs), [creator-hub/hub/server/buildBudgets.mjs](../creator-hub/hub/server/buildBudgets.mjs), [creator-hub/hub/server/creatorAnalytics.mjs](../creator-hub/hub/server/creatorAnalytics.mjs)

## LOBBY-CHECKOUT

**build-required** — POST /api/skill-market/:id/download for priced listings

**Current:** Free downloads exist; paid checkout explicitly returns 409 as not connected.

**Remaining:** Implement a chosen payment service, verified receipts/entitlements, idempotent settlement and refund/revocation policy before enabling paid downloads.

**Completion check:** Free flow still works; payment failure does not grant access; only verified settlement grants the correct entitlement.

**Source:** [creator-hub/hub/server/skillMarket.mjs](../creator-hub/hub/server/skillMarket.mjs)

## LOBBY-REWARDS

**local-only** — Daily Ritual, AI Sparks balance and rewardPlaytest

**Current:** Current public UI always uses the replayable simulator. Retained /api/daily-trivia handlers and private Blob records are separate and are not used to award these displayed Sparks.

**Remaining:** Real spendable rewards would need server-authoritative identity, settlement, abuse controls, redemption/ledger and wallet integration. Preserve the current single 3D flow and reset during testing; do not restore a retired UI/API selector.

**Completion check:** Current reset/playtest regression passes; any future real awards prove exactly-once settlement and cannot be minted by browser edits.

**Source:** [creator-hub/hub/client/src/components/rewardPlaytest.ts](../creator-hub/hub/client/src/components/rewardPlaytest.ts), [creator-hub/hub/client/src/components/DailyTrivia.tsx](../creator-hub/hub/client/src/components/DailyTrivia.tsx), [creator-hub/hub/server/dailyTrivia.mjs](../creator-hub/hub/server/dailyTrivia.mjs), [creator-hub/hub/server/dailyTriviaBlob.mjs](../creator-hub/hub/server/dailyTriviaBlob.mjs)

## LOBBY-WALLET

**design-only** — WalletPreview and asset-commerce plans

**Current:** WalletPreview is a presentation flip with a sample stake. Commerce manifests describe plans; they do not deploy or settle token transactions.

**Remaining:** Before exposing real balances/staking/commerce, connect verified wallet/network reads, transaction approval and confirmed on-chain state. Remove sample amounts from any real-account mode.

**Completion check:** Displayed funds and entitlements match verified network data; reject/cancel/error states remain accurate.

**Source:** [creator-hub/hub/client/src/components/WalletPreview.tsx](../creator-hub/hub/client/src/components/WalletPreview.tsx), [creator-hub/hub/shared/assetCommerce.mjs](../creator-hub/hub/shared/assetCommerce.mjs)

## LOBBY-VIDEO

**design-only** — /api/video/templates/*; capture CLI; /api/studio/recipes

**Current:** Validation, props/command export and local capture/render tools exist. These routes do not run a hosted renderer or remote browser capture service.

**Remaining:** If hosted rendering is wanted, add isolated queued workers, job status, durable artifacts, resource limits and operator review of capture targets/media. Reuse existing CLI/templates.

**Completion check:** A representative rendered recording plays correctly; job failures are visible; outputs retain provenance and cannot expose internal URLs.

**Source:** [creator-hub/hub/server/videoTemplates.mjs](../creator-hub/hub/server/videoTemplates.mjs), [creator-hub/hub/client/src/studioExport.ts](../creator-hub/hub/client/src/studioExport.ts), [creator-hub/capture/capture-apps.mjs](../creator-hub/capture/capture-apps.mjs)

## LOBBY-RECIPE-ADAPTER

**design-only** — Recipe composition adapters

**Current:** Some recipe descriptions explicitly mark proposed Counter/token composition adapters as not implemented. Exporting a plan is not a verified composition.

**Remaining:** Implement and test each proposed adapter against pinned Tari template interfaces before describing it as deployable.

**Completion check:** Pinned integration tests prove access control, resource behavior and composition; update readiness only with evidence.

**Source:** [creator-hub/hub/server/recipes.mjs](../creator-hub/hub/server/recipes.mjs)

## CFG-SUBSCRIPTIONS

**configuration-required** — GET /api/subscriptions/config; POST /api/subscriptions

**Current:** A webhook adapter exists; missing configuration returns 503. Actual provider configuration/delivery was not checked in this audit.

**Remaining:** Provide HTTPS SUBSCRIPTION_WEBHOOK_URL, server-side SUBSCRIPTION_WEBHOOK_TOKEN and SUBSCRIPTION_PRIVACY_URL; receiver must implement the documented pending_confirmation/double-opt-in contract.

**Completion check:** Real confirmation email arrives for an approved test address; repeat delivery is idempotent; failure stays unconfirmed.

**Source:** [creator-hub/hub/server/subscriptions.mjs](../creator-hub/hub/server/subscriptions.mjs)

## CFG-AI-DRAFT

**configuration-required** — POST /api/video/templates/:id/draft

**Current:** Hugging Face drafting adapter exists, gated by HF_DRAFT_ENABLED=1 and a server token. Production provider delivery not verified here.

**Remaining:** Configure HF_TOKEN or HUGGINGFACE_TOKEN and HF_DRAFT_MODEL; add authenticated quotas/rate limits before offering unrestricted paid inference publicly.

**Completion check:** Opt-in provider trial returns validated fields; missing token, provider failure and budget limits fail honestly.

**Source:** [creator-hub/hub/server/videoTemplates.mjs](../creator-hub/hub/server/videoTemplates.mjs)

## CFG-DATA

**configuration-required** — /api/growth/summary; /api/marketing-calendar; /blog/feed.xml; /blog/sitemap.xml; source refresh

**Current:** Adapters exist: growth cloud needs GROWTH_GITHUB_TOKEN, calendar needs a snapshot or authorized Trello configuration and is deliberately local-only, blog needs PUBLIC_SITE_URL. Public origin is set in the Vercel adapter.

**Remaining:** Verify owner-managed configuration, source permissions, freshness and last-good fallbacks. Do not remove the local-only calendar restriction or copy private source data into the public repo. No new endpoint is implied.

**Completion check:** Configured adapter returns current authorized data; missing/stale/error state is explicit; restricted routes stay restricted.

**Source:** [creator-hub/hub/server/growthCloud.mjs](../creator-hub/hub/server/growthCloud.mjs), [creator-hub/hub/server/marketingCalendar.mjs](../creator-hub/hub/server/marketingCalendar.mjs), [creator-hub/hub/server/app.mjs](../creator-hub/hub/server/app.mjs), [creator-hub/hub/server/sourceMonitoring.mjs](../creator-hub/hub/server/sourceMonitoring.mjs), [creator-hub/hub/server/sourceRefresh.mjs](../creator-hub/hub/server/sourceRefresh.mjs)

## OPS-OCTOBER-CHANNEL

**build-required** — Once-daily October monitor notification delivery

**Current:** Repository workflow checks at 09:17 UTC and saves Actions summary/artifact. It has no dedicated-channel delivery adapter. External automations are outside this source audit.

**Remaining:** Connect the existing daily workflow to the approved dedicated channel using a server-side secret, deduplicated notifications and retry/failure reporting. Keep one scheduled daily check; no auto-publication.

**Completion check:** One daily run delivers to the intended channel; retries do not duplicate; errors are visible and candidates remain review-only.

**Source:** [.github/workflows/october-monitor.yml](../.github/workflows/october-monitor.yml), [scripts/monitor-contest.mjs](../scripts/monitor-contest.mjs)

## OPS-DEPLOY

**configuration-required** — GitHub main to Vercel deployment

**Current:** Maintainer CLI deployment is documented; automatic Vercel Git integration previously required the owner GitHub login connection. Current account setup was not audited.

**Remaining:** Confirm/link the repository to the existing Vercel project and production branch main if automatic website deployment is desired. Keep passing checks and source SHA traceability.

**Completion check:** A reviewed main commit produces a ready deployment of that exact SHA; content-only GitHub Pages workflow stays separate.

**Source:** [api/index.mjs](../api/index.mjs)

## RETIRED-HOSTING

**retired** — Writes to /api/projects*, /api/assets*, /api/recipes/:id/projects, /api/challenges/submissions

**Current:** Public entry point returns 410 PROJECT_HOSTING_RETIRED. Old implementations/read paths remain for legacy compatibility/tests.

**Remaining:** Do not revive these paths to implement Workbench. Build the separate Workbench services and publication contract; preserve the guard.

**Completion check:** Public app returns 410 for each retired write even when Workbench services are injected.

**Source:** [creator-hub/hub/server/inspirationLobby.mjs](../creator-hub/hub/server/inspirationLobby.mjs), [creator-hub/hub/server/projects.mjs](../creator-hub/hub/server/projects.mjs), [creator-hub/hub/server/assets.mjs](../creator-hub/hub/server/assets.mjs), [creator-hub/hub/server/challenges.mjs](../creator-hub/hub/server/challenges.mjs)
