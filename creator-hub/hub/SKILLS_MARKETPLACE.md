# Skills, workflows and creator profiles

Creator Arena also offers a **Small budgets** board for recommended builds, with reported cash, free credits and time separated. See [Build budgets](BUILD_BUDGETS.md) for eligibility, cost scope, API and verification limits.

Implemented September 22, 2026. Entry: `/skills`; native reference: `/skills/native`; creator pages: `/creators/:id`.

## Product loop

Discover a reusable skill or full workflow, inspect its prerequisites, download its Markdown, add it to a dedicated project folder, then ask an agent to read and apply it. Preserve existing project instructions and review executable steps. This provides context to an agent; it does not train a model or guarantee compliance. No package is automatically installed or executed.

Creators set up a profile before publishing. Portfolio visibility and participation in creator rankings default to on and can be changed in the setup form. Portfolio links can point to hub projects or external builds. Hiding a portfolio does not remove published listings or their attribution. Work ownership is not inferred from matching display names. Existing anonymous project authors need explicit identity linking before automatic portfolio association.

## Portable publishing standard, v1

Every skill or workflow requires:

- title, description, version, creator identity and free/paid price;
- purpose: when to use it and expected outcome;
- requirements: tools, versions, dependencies, source references, inputs and permissions;
- setup: ordered installation/configuration instructions;
- instructions: task steps, inputs/outputs, component links and handoffs;
- verification: observable success criteria and evidence;
- recovery: known failures, rollback and safe retry guidance.

The publishing form and API enforce presence and length limits. This is the hub's common authoring standard, not a claim that all agent frameworks support the same installation path. Free skill downloads use `SKILL.md` with name/description frontmatter. Workflows use `WORKFLOW.md` with the same structured sections. Native guides retain original source Markdown and lifecycle labels. Keep their matching repository checkout for supporting examples and relative links. The download API additionally supplies JSON metadata and installation guidance. Complete executable ZIP packages, graph imports and environment-specific one-click installers remain future adapters.

The native verified-only router and Git revision routes are unchanged. Community publications do not automatically become verified native TariSkills. The bundled creator workflow is a runbook, not an executable deployment system.

## Commerce

Creators can publish free or USD-priced listings. Free Markdown downloads work now. Paid content is a preview: instructions and recovery are omitted from catalog responses, and the server rejects paid downloads until checkout is connected. There is no payment, receipt verification, entitlement delivery or payout in this change. This matches the asset store's network-later boundary. Marketplace settlement should reuse digital-asset entitlement work rather than create a second payment system. Never unlock content based on client-reported payment success.

## Metrics and visibility

Count one download per browser identifier, listing and UTC day after the API successfully generates the response. This is a delivery request, not proof of a saved file or agent installation. Persist only a SHA-256 digest of the random browser identifier. All-time downloads sort popular listings. Last seven days sort trending; a badge requires at least three downloads. Creator rankings aggregate listings' downloads and exclude profiles that opt out. No fabricated counts or paid orders contribute. These prototype counters are not Sybil-resistant and must not govern rewards or payouts.

## Storage, ownership and deployment boundary

`server/skillMarket.mjs` reads the native catalog and persists community profiles, listings and download events to runtime `skill-market.json` under `CREATOR_HUB_DATA_DIR`. It is not a committed catalog or backup. Synchronous writes plus atomic rename suit this single-process local prototype, not multiple hosted workers.

Profile creation returns a random browser-held editing capability once. The server stores only its hash and requires it to update the profile or publish under that identity. Public responses never expose it. Browser storage loss currently loses editing access; authenticated accounts, recovery, rate limiting and moderated publication are required before public hosting. No credentials go into repository commits.

## Agent handoff and validation

Files: `server/skillMarket.mjs`, routes in `server/app.mjs`, UI `client/src/pages/SkillMarket.tsx` and `.css`, route definitions in `main.tsx`, navigation in `Layout.tsx`.

Tests cover ownership rejection, malformed listings, free workflow delivery, paid-download blocking, private instruction redaction, duplicate download suppression, URL scheme validation, profile visibility and restart persistence. Existing native raw skill routes remain covered by the original tests.

Continue through existing CH skills, marketplace and analytics issues (#33, #39, #61, #74, #75). Next acceptance work: identity linking for all project/asset authors; immutable listing revisions/editing; packaged supporting files and workflow graph import/export; authenticated account recovery; common commerce receipts/entitlements; anti-abuse counters and warehouse event exports. Do not claim these are implemented by the local publishing form.

Validation on September 22: all 116 server and 27 client tests passed; production build passed. HTTP checks verified profile creation, rejected unauthorized edits and JSON 404 responses. Browser checks verified the live 18-guide plus one-workflow library, workflow filtering and checked-by-default profile controls. At 390px, the navigation was repaired to remain fully visible with no horizontal overflow. Server restarted on localhost:4189 to expose the new routes. This is a local preview, not a public deployment.

## Creator Arena presentation (September 22)

The skills sidebar now uses a competition-style leaderboard: champion spotlight, top-ten roster, relative score bars, creator profile links and independent rolling-seven-day/all-time controls. Zero activity shows an open podium, never fabricated competitors. Ties share competition rank (1, 1, 3); alphabetic ordering only stabilizes tied rows. Visibility opt-outs remain excluded. Counts still represent local download events, not installs or payout eligibility; counting details are in an expandable explanation. The entry button opens the existing profile/publishing flow.

Implementation: `client/src/components/CreatorLeaderboard.tsx` and its scoped CSS. Tests cover ties, window selection, aggregation, invalid/empty counts and privacy. Build and 30 client tests passed; browser checks covered period controls, a populated browser-only fixture and mobile overflow. Fixture scores were not written into runtime data. This changes presentation and aggregation only, not collection or reward rules.

## Bundled community skills

`server/bundledSkills.mjs` explicitly registers curated repository skills alongside native TariSkills and community submissions. Readable Code is attributed to m4r1m0 and reads its download directly from `.agents/skills/readable-code/SKILL.md`; its pinned source is derived from adjacent `upstream.json`. Do not make a separate copy for the website or imply this upstream attribution is a claimed creator account. Agent onboarding alone does not register a skill in the marketplace.

Find it at `/skills?q=readable`. The market test checks listing, attribution, source URL and byte-for-byte download equality with the onboarding file. Search query URLs now initialize the Skills filter for shareable discovery.
