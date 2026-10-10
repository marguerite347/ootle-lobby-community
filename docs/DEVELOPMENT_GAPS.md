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
| [LOBBY-CHAT](#lobby-chat) | build-required | Lobby Chat sidebar and /chat pop-out; /api/chat/*; legacy /api/community-chat/*, /api/project-chat/*, /api/collective-chat/* |
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
| [COMMUNITY-METRICS](#community-metrics) | build-required | GET /api/community-projects/metrics |
| [WB-FORK](#wb-fork) | configuration-required | /workbench and Workbench navigation links |

## WB-RUNNER

**build-required** — POST /api/workbench/runs; GET /api/workbench/runs/:id

**Current:** No compiler or test runner is supplied; requests return 501. Browser abort stops polling only; no server cancellation endpoint is defined.

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

**Current:** Disconnected feed returns an empty list. Existing reviewed October content still works. Reviewed external Community Projects load independently from the public content feed; Workbench publishing remains disconnected. September, October, Community, Official and future Workbench publications share ProjectCard presentation. The current Workbench Publication schema/adapter has no cover or technology fields and passes preview:null and empty technologies; extend it before promising full card metadata.

**Remaining:** Provide approved durable public records, public-safe projection, stable IDs and pagination when needed. Wire approved publication writes to this same source. Supply reviewed poster/video provenance, evidenced technology labels and project-specific metrics with each approved publication; disconnected Workbench records have no fabricated covers or counts.

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

**Current:** Edits and publication metadata persist only in this browser. Text-file/folder import and ZIP export are working; ZIP archive import is not implemented.

**Remaining:** If cross-device/account workspaces are required, build an authenticated durable workspace/version API and conflict/recovery behavior. This is separate from public listings.

**Completion check:** Reload retains local edits now; future sync must round-trip across two devices and reject unauthorized access.

**Source:** [creator-hub/hub/client/src/pages/Workbench.tsx](../creator-hub/hub/client/src/pages/Workbench.tsx), [creator-hub/hub/client/src/workbench/model.ts](../creator-hub/hub/client/src/workbench/model.ts)

## LOBBY-CHAT

**build-required** — Lobby Chat sidebar and /chat pop-out; /api/chat/*; legacy /api/community-chat/*, /api/project-chat/*, /api/collective-chat/*

**Current:** The Lobby sidebar and larger /chat view share one community chat component and a separate default-off authenticated service with PostgreSQL messages/replies, private-channel membership, shared quotas, moderator reports/audit/restore, hashed sessions and GitHub PKCE. Local disk-backed preview and tests pass. Legacy anonymous writes remain blocked. External connections and delivery workers are not enabled. The shared hosted test supports automatic guest joining with generated names and optional customization with separate server-owned member identities, secure seven-day sessions and durable join limits through a private Supabase schema. Optional invitations retain owner/moderator access; ordinary testers need no name entry, invitation or GitHub account. Renaming preserves identity, permissions, quotas and historical message author labels. Native chat now includes channel/thread-scoped typing names from real composer input, refreshed every 1.2 seconds, with eight-second server expiry and four-second input-idle clearing. Draft text is never transmitted by typing activity; messages refresh every 1.5 seconds. This uses the same private PostgreSQL service and existing guest sessions. The conversation uses Chatscope message/separator/typing display components, compact identity-based groups, an IME-safe growing composer, timestamp-and-ID history cursors, independently retrieved paginated threads, truthful reconnect status, synchronized channel URLs, and durable per-account emoji reactions. Loaded history pages refresh reactions and moderation as well as recent messages.

**Remaining:** Complete broad production abuse-prevention, backup and scheduled-retention verification; verify the identity provider if enabled. Guest names are unverified and browser/session blocking does not prevent rejoining. Add channel administration, attachments, edits and notifications. An always-available bot responder remains unimplemented. Connect approved platform adapters with verified webhooks/Gateway, source audience boundaries, inbound deduplication/echo suppression, and receipt-backed outbox delivery before enabling cross-app posting.

**Completion check:** Test hosted messages/reports across deployments and app instances, identity/role isolation, quotas, moderation, retention and backups. For each connected channel verify permitted import, explicit destination approval, no echoes/duplicates, and actual provider delivery receipts. Verify typing appears in a separate guest session before send, clears on pause/send/context change, never crosses restricted channels or threads, survives multiple server instances, and supports reduced motion. Verify two guests can react and unreact across reloads, load earlier messages without false unread counts, open a thread older than the initial window, preserve drafts after failed sends, and use keyboard/mobile controls.

**Source:** [creator-hub/hub/server/communityChat.mjs](../creator-hub/hub/server/communityChat.mjs), [creator-hub/hub/server/projectChat.mjs](../creator-hub/hub/server/projectChat.mjs), [creator-hub/hub/server/collectiveChat.mjs](../creator-hub/hub/server/collectiveChat.mjs), [creator-hub/hub/server/paths.mjs](../creator-hub/hub/server/paths.mjs), [creator-hub/hub/server/community/store.mjs](../creator-hub/hub/server/community/store.mjs), [creator-hub/hub/server/community/router.mjs](../creator-hub/hub/server/community/router.mjs)

## LOBBY-AGENT-BRIDGE

**build-required** — Collective chat agent coordination

**Current:** The UI explicitly says the live Hub-to-agent bridge is not connected. Chat messages do not execute agent work.

**Remaining:** Define and implement authenticated job dispatch/status and approval boundaries if live agent coordination is enabled.

**Completion check:** A verified agent job can be traced to its approved request and outcome; posting a chat message alone cannot execute code.

**Source:** [creator-hub/hub/client/src/chat/copy.ts](../creator-hub/hub/client/src/chat/copy.ts), [creator-hub/hub/server/collectiveChat.mjs](../creator-hub/hub/server/collectiveChat.mjs)

## LOBBY-COMMUNITY-WRITES

**build-required** — /api/engagement/*; /api/creator-profiles/*; /api/skill-market*; /api/learn/resources; /api/learning/lessons*; /api/build-budgets*; /api/creator-analytics*

**Current:** The public route allowlist denies all persistent profile, skill, learning, engagement and analytics writes before parsing input. Bundled skill downloads are stateless and checked against a committed file-digest manifest. Runtime-authored lessons and skills are excluded from public discovery.

**Remaining:** Before re-enabling: shared transactional ownership and storage, moderation, reserved official names, bounded queues, retention and shared quotas.

**Completion check:** Concurrent writes survive restart; unauthorized edits and role claims fail; analytics deletion/retention works; lesson evidence is never exposed.

**Source:** [creator-hub/hub/server/engagement.mjs](../creator-hub/hub/server/engagement.mjs), [creator-hub/hub/server/skillMarket.mjs](../creator-hub/hub/server/skillMarket.mjs), [creator-hub/hub/server/communityLearning.mjs](../creator-hub/hub/server/communityLearning.mjs), [creator-hub/hub/server/learningLoop.mjs](../creator-hub/hub/server/learningLoop.mjs), [creator-hub/hub/server/buildBudgets.mjs](../creator-hub/hub/server/buildBudgets.mjs), [creator-hub/hub/server/creatorAnalytics.mjs](../creator-hub/hub/server/creatorAnalytics.mjs)

## LOBBY-CHECKOUT

**build-required** — POST /api/skill-market/:id/download for priced listings

**Current:** Only committed digest-pinned free bundles can be downloaded through the public service, without download-event writes. Incomplete bundled file sets are excluded. Anonymous publishing and paid checkout are unavailable.

**Remaining:** Authenticated entitlement and payment integration remains a separate implementation before paid downloads.

**Completion check:** Free flow still works; payment failure does not grant access; only verified settlement grants the correct entitlement.

**Source:** [creator-hub/hub/server/skillMarket.mjs](../creator-hub/hub/server/skillMarket.mjs)

## LOBBY-REWARDS

**local-only** — Daily Ritual, AI Sparks balance and rewardPlaytest

**Current:** The public UI remains a replayable browser-only practice game. The unused public /api/daily-trivia endpoint is closed for every method, so it cannot create or mutate Blob records. Local retained router registers only on POST start; GET does not issue a session or persist state. Production reset is disabled.

**Remaining:** Do not enable retained Blob trivia publicly without a shared atomic player quota, retention sweep, shared abuse limits and authentication. Existing legacy Blob data was not deleted; retention/migration requires reviewed operator action. Real rewards require a server ledger and verified identity.

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

**Current:** Validation, props/command export and local capture/render tools exist. These routes do not run a hosted renderer or remote browser capture service. Reviewed resource walkthroughs use the existing local recorder and committed public MP4/poster path, with per-resource provenance, manual playback controls and frame/playback review. This does not add hosted capture workers.

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

**Current:** Public subscriptions are disabled by the write allowlist and config reports unavailable. The retained webhook adapter is not invoked publicly.

**Remaining:** Before re-enabling: configure provider, double opt-in contract, shared durable rate limiting and authenticated abuse controls.

**Completion check:** Real confirmation email arrives for an approved test address; repeat delivery is idempotent; failure stays unconfirmed.

**Source:** [creator-hub/hub/server/subscriptions.mjs](../creator-hub/hub/server/subscriptions.mjs)

## CFG-AI-DRAFT

**configuration-required** — POST /api/video/templates/:id/draft

**Current:** Public provider-backed drafting and Hugging Face search are blocked before invoking their adapters. HF_DRAFT_MODEL is the documented model selector; HF_TOKEN/HUGGINGFACE_TOKEN stay server-side.

**Remaining:** Enable only after authenticated shared quotas, budgets and provider consent.

**Completion check:** Opt-in provider trial returns validated fields; missing token, provider failure and budget limits fail honestly.

**Source:** [creator-hub/hub/server/videoTemplates.mjs](../creator-hub/hub/server/videoTemplates.mjs)

## CFG-DATA

**configuration-required** — /api/growth/summary; /api/marketing-calendar; /blog/feed.xml; /blog/sitemap.xml; source refresh

**Current:** Public growth API and growth-export paths are disabled even if GROWTH_GITHUB_TOKEN is present. Calendar remains local-only. Monitoring reports enabled:false when no scheduler starts. Public content uses the deployment snapshot; remote refresh requires exact COMMUNITY_CONTENT_REVISION and COMMUNITY_CONTENT_SHA256.

**Remaining:** Any public private-repository metrics require an explicit reviewed public projection and authentication; never return raw private bundles.

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

**Current:** Security build uses lifecycle-disabled installation and source SHA metadata. Git auto-deploy is not being connected as part of this work while the open-contributor policy decision is pending.

**Remaining:** Only connect Git deployment after owner resolves repository access/review policy and Production-only secrets are verified.

**Completion check:** A reviewed main commit produces a ready deployment of that exact SHA; content-only GitHub Pages workflow stays separate.

**Source:** [api/index.mjs](../api/index.mjs)

## RETIRED-HOSTING

**retired** — Writes to /api/projects*, /api/assets*, /api/recipes/:id/projects, /api/challenges/submissions

**Current:** Public persistent writes return 410 PUBLIC_WRITES_DISABLED; private/provider services return 410 PUBLIC_SERVICE_DISABLED. Served API guides filter operations using the same access policy. Old write implementations remain local-only reference and legacy test material.

**Remaining:** Do not revive these paths to implement Workbench. Build the separate Workbench services and publication contract; preserve the guard.

**Completion check:** Public app returns 410 for each retired write even when Workbench services are injected; public OpenAPI and llms guides omit those operations while retaining stateless download/validation/export routes.

**Source:** [creator-hub/hub/server/inspirationLobby.mjs](../creator-hub/hub/server/inspirationLobby.mjs), [creator-hub/hub/server/publicAccess.mjs](../creator-hub/hub/server/publicAccess.mjs), [creator-hub/hub/server/contract/openapi.mjs](../creator-hub/hub/server/contract/openapi.mjs), [creator-hub/hub/server/projects.mjs](../creator-hub/hub/server/projects.mjs), [creator-hub/hub/server/assets.mjs](../creator-hub/hub/server/assets.mjs), [creator-hub/hub/server/challenges.mjs](../creator-hub/hub/server/challenges.mjs)

## COMMUNITY-METRICS

**build-required** — GET /api/community-projects/metrics

**Current:** Public GitHub stars/push dates and complete project-specific Discourse reply counts work for reviewed Community, Official Tari and October records. Daily caching is per warm server instance; bundled counts survive upstream outages. Shared directory posts covering several projects have unknown per-project counts. Clean deployments tolerate an absent optional local metrics cache and preserve unknown values until refresh.

**Remaining:** For globally once-daily refresh across serverless cold starts, persist and coordinate the daily cache. Optionally configure a GitHub read token for higher rate limits.

**Completion check:** Across cold starts and upstream failures, retain counts and checkedAt; show unknown when never verified. Confirm no more than one global upstream refresh per project per day.

**Source:** [creator-hub/hub/server/communityProjectMetrics.mjs](../creator-hub/hub/server/communityProjectMetrics.mjs)

## WB-FORK

**configuration-required** — /workbench and Workbench navigation links

**Current:** The earlier custom editor entry is replaced by a redirect to the actual Remix fork at https://ootle-workbench.vercel.app/. Browser-local workspaces remain untouched; /workbench-backup exports them for import in the fork. Tari integration work now lives in marguerite347/ootle-workbench.

**Remaining:** Maintain the fork deployment and document the split ownership. Complete the fork developer handoff items for hosted compilation, wallet transactions, AI and shared Lobby publishing. The legacy /api/workbench stubs remain unconnected and are not used by the fork.

**Completion check:** Follow both a Lobby client-side navigation and a direct /workbench request into the actual fork. Download an old browser workspace and import its files into Remix. Do not claim network deployment or a published submission without a real receipt.

**Source:** [creator-hub/hub/client/src/pages/WorkbenchEntry.tsx](../creator-hub/hub/client/src/pages/WorkbenchEntry.tsx)
