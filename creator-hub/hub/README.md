# Ootle Creator Jam (implementation)

Brand: [Ootle Lobby](../BRAND.md) · Design system: [tokens, components and art direction](../design-system/README.md). Previously called Creator Hub; existing paths, package IDs and storage keys remain compatible.

A community-led discovery and **composable game-making** layer over Tari Ootle and
open-source game/creative ecosystems. This is the first working implementation of the
product direction in [`../../CREATOR_HUB.md`](../../CREATOR_HUB.md), following the record
contract in [`../TEMPLATE_MARKETPLACE.md`](../TEMPLATE_MARKETPLACE.md).

> Private foundation work. Testnet apps are **not** production-ready. External-engine
> resources are **not** verified Tari integrations. Imported facts link out to their
> sources and are kept separate from any editorial/community layer.

## Reusable presentation kit

Visit `/create/ui-kit` for interactive examples and setup instructions. See [component usage and handoff](GAME_UI_KIT.md). The homepage reuses the live creator standings, published gameplay and challenge APIs.

## What it does

- **Home** — the community front door: featured releases and their Riffs, weekly
  challenges, creator standings and paths into creating. It links to Discover instead
  of repeating catalog search, popularity reels, collection rows or source cards.
- **Discover's entrance** starts with search and filters, not the Home release spotlight.
  Full source freshness is available from Discover and `/sources`. Keep these roles
  distinct when adding sections; resource browsing belongs in Discover, participation
  and community highlights belong on Home.

- **Discover** — a searchable, faceted catalog of real resources indexed from:
  - Tari Ootle WASM starter templates ([`tari-project/wasm-template`](https://github.com/tari-project/wasm-template))
  - the canonical [Tari Wiki app directory](https://wiki.tari.com/resources:app_directory:start), with hourly refresh while the server runs
  - the supplemental Ootle Testnet [Community Apps Directory](https://community.tari.com/t/ootle-testnet-community-apps-directory/281) (Discourse)
  - GDevelop examples ([`GDevelopApp/GDevelop-examples`](https://github.com/GDevelopApp/GDevelop-examples))
  - Luanti games & mods ([ContentDB](https://content.luanti.org/))
- **Learn** — education and walkthroughs that support the same catalog and creation journey.
- **Create** — one entry point for goals, starter templates and configurable recipes. Recipes
  save validated parameters, pinned source revisions and adapter requirements into projects.
- **Projects** — continue work, save versions, share a URL within the running hub, leave
  feedback and Riff a saved revision. Every saved state is a Git commit. These are project
  configurations, not compiled or deployed games. Attached resources are references, not
  proof of executable compatibility.
- Old Build, Start building, Recipes and Studio URLs redirect into these four destinations.
  Starter selections and recipe/goal links are retained.
- **Sources** — provenance and freshness for every connector; failed ingestion retains the
  last good record and marks it stale. Curated registries are always provisional:
  loading a local snapshot is not an upstream freshness check. Their source
  `lastSuccessAt` stays empty; record review dates remain the editorial evidence.

## Architecture

```
server/            Express API (ESM, Node)
  model.mjs        Canonical record contract (provenance, readiness, verification, editorial)
  connectors/      Live source connectors -> normalized records
  ingest.mjs       discover -> normalize -> write snapshot (retains last-good on failure)
  catalog.mjs      Loads snapshot, search projection, collections, onboarding resolution
  projects.mjs     Git-backed project store: publish = commit, fork = clone from any ref
  app.mjs          REST API
client/            Vite + React + TypeScript SPA
data/seed/         Committed catalog snapshot (real data) so the hub runs offline
data/{cache,projects}/  Runtime state (gitignored; redirectable via CREATOR_HUB_DATA_DIR)
```

## Setup and provider access

Read [the agent setup checklist](AGENT_START.md#setup-and-access-check-before-you-start) before selecting a generation or render workflow. Run `npm run setup:check` for local dependency/credential presence; verify provider permissions, licenses and credits separately. Never commit secrets.

## Fresh start

Clone current `main`, run `npm ci` and `npm run build` here, then `npm start`. A Git
clone includes the app and catalog; there are no published game snapshots to restore.
Local browser previews (`localhost`, `127.0.0.1`, `[::1]`) use the current 3D Daily Ritual playtest by default, including plain URLs, fresh tabs and reloads. AI Sparks are simulated and no server daily attempt is consumed. `?rewardPlaytest=0` explicitly opens the legacy server-backed comparison for diagnostics; that opt-out does not carry into normal local navigation. Hosted behavior is unchanged. Verify both wheels from the plain homepage after reward or preview-routing changes.

`npm run build` restores the Daily Spark wheel runtime if it is missing
(`npm run restore:wheel` forces it); the Daily Spark reward media sources are in
Git LFS under [`../handoff/reward-proof/`](../handoff/reward-proof/README.md).
Provider credentials are separate.

## Develop

```sh
npm install            # installs server + client (workspace)
npm run ingest -- --seed   # refresh the committed snapshot from live sources (optional)
npm run build          # build the client
npm start              # serve API + built client on http://127.0.0.1:4180
npm test               # backend unit/integration tests (catalog + git project store)
```

Dev with hot reload: `npm run dev:server` and `npm run dev:client` (Vite on :5180, proxying `/api`).

## Guardrails encoded in the model

- Native Ootle vs external-engine resources are always distinguished; native sorts first.
- `readiness` never implies production; `network` is recorded separately.
- Unknown license is treated as not-free-to-use; unknown Tari compatibility is `null`, not assumed.
- Provenance (source, upstream revision, fetch time, freshness) travels with every record.
- Ingestion never writes the `editorial` layer, so refreshes never overwrite curation.

## Video configuration prototype

Create → Make a video configures three branded text compositions and exports props
plus a local render command. It does not render, capture footage, publish, or attach
clips to saved projects yet. Project and clip IDs remain empty placeholders; campaign
and destination metadata can be entered manually. Brand-only previews cannot be
labeled recorded gameplay. Follow `../video-templates/README.md` for rendering.

Optional AI copy drafting requires `HF_DRAFT_ENABLED=1` and `HF_TOKEN` (or
`HUGGINGFACE_TOKEN`) on the server. Enabling it permits provider usage that may cost
money. Requests time out after 30 seconds and do not automatically retry. Keep this
prototype bound to localhost; authenticated access, quotas and per-user usage controls
are required before exposing paid drafting on a shared host. Manual entry always works.

## Game-type starter library

`/create` now includes the library; `/create/starters` is its focused view.
`GET /api/game-starters` projects the canonical catalog into ten genre groups,
with URL-persisted search, engine and kind filters. Existing starters/components
remain discoverable alongside six curated incremental/card/Godot records.
Reference candidates and SMODS mods are distinct from standalone foundations.

Maintain new entries in `../resources/game-starters.json`; the `game-starters`
connector preserves provenance and unknown integration status. To refresh only
this curated source, run `npm run ingest -- --only=game-starters --seed`.
It loads local editorial data, not a live crawl of GitHub Topics. Existing runtime
caches must be refreshed through ingestion to pick up changed seed entries.
Genre inference lives in `server/gameLibrary.mjs`; add tests when changing rules.
The full upstream ecosystem is not automatically imported or certified.

Choosing a starter passes its canonical resource ID into the existing project
form. Saving versions tracks project configuration; Source / fork opens the
upstream repo for actual source reuse. No code is downloaded or executed by this
flow. Project components can reference Tari templates; those references do not
constitute an implemented game-to-Ootle adapter.

### App preview media

App-card previews combine committed seed posters with runtime `previews/index.json`, served from `/previews`. Eleven generated PNG posters ship in Git; video recordings and rendered clips remain runtime-only. Run `npm run previews` to render covers, attempt webpage captures, then assemble the runtime index. `--no-capture` and `--no-covers` skip those stages. Dependency installs use lockfiles; failed optional stages warn and assembly still runs. Capture needs Chrome, system ffmpeg and network access; the command installs the Playwright recorder helper. To run individual steps:

1. Generate captures with the documented `../capture` tool, or render fallback covers in `../video-templates` using `node scripts/render-covers.mjs`. Set `REMOTION_BROWSER_EXECUTABLE` if using an installed Chrome.
2. Run `node scripts/prepare-previews.mjs` here. Captures are selected only when their matching manifest entry reports success for the same URL. Otherwise an available generated cover is used. Old poster files are cleared before regeneration.
3. The running server detects a new or atomically replaced index within about a second. The Vite dev server proxies `/previews` as well as `/api`. Missing files return 404, not SPA HTML.

`CREATOR_HUB_PREVIEWS_DIR` overrides runtime storage. Preview matching checks demo, source and repository URLs before falling back to title slug, and never replaces a populated upstream preview. Entries pointing to missing files are omitted. Generated covers are decorative artwork, not captured gameplay. The card label distinguishes them from recorded webpages. A fresh checkout displays seed posters but no video clips; hosting/backups and automated refresh remain separate operational work.

Preview playback is shared across Discover, Home and resource details. Visible cards autoplay muted loops, pause offscreen, and retain the poster until playback starts. Reduced-motion users get a still preview unless hovering. Built-in educational workflows declare conceptual readiness; unknown imported readiness displays “Not assessed” rather than crashing Learn or detail pages. See `../capture/README.md` for capture retry behavior and refresh operations.

### Recovering from a local preview interruption

The client retries failed GET requests and HTTP 502/503/504 responses twice, after
500 ms and 1.5 s. It never automatically repeats writes (project creation, saves,
uploads or other mutations), permanent HTTP errors or malformed JSON responses.
Learn retains its filters, shows an honest unavailable state after those retries,
and retries again when the browser regains focus or connectivity. Manual Retry
remains available. These behaviors are covered by `client/src/api.test.ts` for the
request boundary.

When a user reports a broken preview, inspect their existing browser tab as well
as the server. A tab can retain an old bundle or a browser-level connection-error
page even after the server recovers. Refresh that tab and verify the visible
Learn library, Discover cards, Create choices and saved Projects. A successful
API request from a separate test tab is insufficient evidence. Client-only
changes need a rebuild and browser refresh, not a backend restart. Browser-level
connection errors cannot be recovered by React code because React is not loaded.

September 21 recovery: the existing Chrome tab still showed the old 148-resource
home page and placeholders. Refreshing loaded the current artwork; navigation
then showed 157 Discover resources, 35 Learn resources, 93 Create game foundations
and the existing saved project. GET recovery and accurate Learn error status were
added to prevent a brief API outage leaving the library stuck unnecessarily.

### Resource detail design (September 22)

All `/resource/:id` pages use `client/src/pages/Detail.css`: a responsive media and
summary header, deduplicated source actions, template-to-project action, and a
readable facts sidebar. Source provenance remains available in an expandable
section. Related learning and discussion stay with the main content. Keep fact
values in a flexible column; the previous 160px label grid overflowed its 240px
sidebar. Resource navigation clears old errors and ignores responses after route
changes. Existing bespoke media and shared playback behavior are preserved.

Validation: client build and 25 tests passed; ShadowTix checked at 375, 768, 1024
and 1440px with no document overflow. Airdrop Template's primary action opened
project setup with the correct base template. Local preview rebuilt without a
backend restart; no new public deployment.

### Create layout follow-up (September 22)

Create now separates asset discovery/uploads and video promotion into full clickable
cards. Starter card actions use a wrapping two-column grid with the primary action
across the full width. Button links explicitly participate in layout as inline-flex
boxes, preventing padded inline anchors from painting over adjacent copy. Genre
filters wrap on mobile, and starting-path choices use compact rows on small screens.
Do not replace these with fixed-height containers or absolutely positioned actions.

Validated all three Create paths in the browser. At 375, 768, 1024 and 1440px,
there was no document overflow or intersecting controls in genre, tool and starter
action groups. Existing source links, template selection and guided composition
routes are retained. Local client rebuilt without restarting the API.

## Live app-directory updates

The public [Tari wiki directory](https://wiki.tari.com/resources:app_directory:start) is canonical for app facts. The running server checks it and the supplemental forum hourly, retaining last-good data on failure. See [source refresh operation and handoff](SOURCE_REFRESH_HANDOFF.md) for configuration, source boundaries and the added creator references.

## Asset store and commerce authoring

Open `/create/assets` for the expanded source catalogs, uploads, listing drafts and customizable NFT designs. See [ASSET_STORE_HANDOFF.md](ASSET_STORE_HANDOFF.md) for setup, source refresh, implementation boundaries and the network adapter checklist. No network is connected to this authoring flow.

## Published discovery and project design (September 22, 2026)

Projects now separates published creations from editable workspaces, with search, a gameplay feature and Play / Explore actions. No games are published yet (see Games below). The home page's Fresh from the creators section consumes the same project API automatically. Only registered executable releases are featured; forks that still reference their parent's build remain workspaces until separately released. First publication time is retained across saves. Older releases fall back to creation time.

Trending is a local community activity signal: at least three comments plus direct Riffs dated within the trailing seven days, ordered by that total. No badge is awarded merely for publishing or saving. Anonymous engagement is not verified unique-user demand. Stars are excluded because their current store has no timestamps. A future authenticated analytics service can replace this proxy. The home trending section stays hidden without qualifying releases; Projects explains its empty state.

Handoff: shared ProjectShowcase components render recorded release media, pause offscreen and respect reduced-motion preferences. Pure discovery tests cover release filtering, workspace forks and trending qualification. No generated statistics or placeholder covers were added.

Newly published projects now lead both the home page and the unfiltered Discover landing page, above introductory copy and resource browsing. Filtered Discover results remain focused on the selected search. Both surfaces use the shared release list automatically.

### Skills and creator marketplace

`/skills` now offers native agent guides, community skill/workflow publishing, free Markdown downloads, paid-listing previews, creator profiles and usage-based rankings. See [Skills marketplace standard and implementation handoff](SKILLS_MARKETPLACE.md) for setup, visibility defaults, metrics and the network-later commerce boundary.

### Community learning submissions

Learn includes **Share a resource**, using the existing creator profile's editing capability. Required fields: title, original HTTPS URL, original author, learning summary, recommendation/use case, prerequisites (or None), ecosystem, learning goal, difficulty and format. The form retrieves enum options from `/api/learn/submission-standard` (v1); `POST /api/learn/resources` validates and saves the same format. Recommendations are immediately searchable in Learn and available through resource detail routes, with community attribution and unverified provenance. Sharing a link does not verify its content, availability or Tari compatibility.

`server/communityLearning.mjs` stores submissions separately in runtime `community-learning.json`, so upstream ingestion cannot overwrite community recommendations. URLs lose fragments and tracking parameters for duplicate detection against both community and ingested records. Credentials and non-HTTPS links are rejected. No external page is fetched or executed during submission. Profile authentication reuses `skillMarket.authenticate`; author display names cannot be supplied to impersonate another creator. Runtime stores remain outside Git.

Handoff: UI `client/src/pages/ShareLearning.tsx`, integrated into `Learn.tsx`; catalog `all/get` includes community rows so existing filters/detail/engagement work. Tests cover malformed submissions, URL validation, duplicate links, original attribution and persistence. Public hosting still requires shared account recovery, moderation/reporting and abuse controls. Current profile editing remains browser-local, as documented in SKILLS_MARKETPLACE.md.

### Creator completion pass: local publishing and interaction

- Global Search (Cmd/Ctrl+K) searches the catalog without leaving the current flow.
- `/create/ui-kit` contains reusable success, upgrade and achievement effects. Sound is opt-in; reduced motion produces a static confirmation.
- Project history can compare a saved revision with the latest saved recipe. Forking uses an inline form instead of browser prompts.
- `/insights` is an opt-in local analytics pilot with seven-day comparison and self-reported learning progress. No wallet addresses or page content are recorded. Retention is capped at 10,000 events. This is not production attribution, verified activation, revenue analytics or a warehouse.
- Runtime project repositories, artifacts, clips and analytics live under `CREATOR_HUB_DATA_DIR`. Back up this directory separately; it is not committed application source.

## Resource media across checkouts

Catalog data and runtime media are separate. A new `CREATOR_HUB_DATA_DIR` does not
inherit another checkout's videos. Before reviewing or shipping a preview instance,
reuse the existing approved library rather than regenerating artwork:

```sh
CREATOR_HUB_DATA_DIR=/path/to/runtime npm run media:import -- /path/to/existing/previews
npm run media:check -- http://127.0.0.1:4180
```

Use the same data directory for import and server startup. Alternatively set
`CREATOR_HUB_PREVIEWS_DIR` to a persistent shared media directory for both. The importer
preserves review evidence, validates generated-video hashes, skips retired covers,
copies media to immutable content-hashed filenames, and atomically merges the index.
It does not review new artwork or prove a capture is good gameplay.

`media:check` fails for missing homepage videos, broken local media responses, or
home/search/detail disagreement. Its JSON also lists all catalog resources still
missing video; add `--all` to fail on any missing catalog video. HTTP checks are not
playback checks: inspect actual cards at desktop/mobile sizes and verify advancing
frames, legibility, reduced motion and a useful poster. Never call a placeholder
completed artwork. See [the app-wide presentation standard](../VIDEO_PREVIEW_POLICY.md#app-wide-presentation-contract).

## Project learning loop

Open `/skills/learning-loop`, or use **Capture a lesson** on a project. The same
workflow is available to HTTP-capable agents at `/learning-loop.md`, linked from
`/agent-start.md`. The canonical portable runbook is
[creator-learning-loop](../../.agents/skills/creator-learning-loop/SKILL.md).

Private, profile-owned drafts store selected evidence separately from public skill
text under `CREATOR_HUB_DATA_DIR/private-learning/lessons.json` (directory mode 0700,
file 0600). This is local access control, not encryption or production account
security. New drafts record the source project's current Git revision privately.
The source project is context, not an ownership assertion. Raw session files are
never read by the server. API reads and mutations of drafts require the existing
creator profile edit key; private responses are not cacheable.

Review confirms evidence and sanitized public content. A current accepted trial is
required before explicit publication. Edits restart review; a failed latest trial
blocks publication. Published text is immutable and can be withdrawn. Downloads and
the agent index read the same canonical lesson record, not a copied marketplace
listing. Public bundles contain only inspected content, a sanitized trial summary,
creator attribution and lesson provenance; private excerpts, artifact locations and
measurements do not ship. This records creator attestations, not independent tests.

Metrics track user corrections, wasted generations, time to an acceptable result and
credits in equivalent provider units. Unknown values stay null, not zero; one trial
is not evidence of general savings. Beacon support is a manual/agent candidate
handoff with a documented envelope. No collector, background learning job, external
Jev evaluator or paid API is installed or called by this feature.

## Persistent storage and history deletion

Use `npm run start:persistent` only with an explicitly configured persistent cloud volume on Linux. See [storage and history](STORAGE_AND_HISTORY.md) for migration, backup scope, management-key recovery, version deletion and activity clearing. Existing game/player save persistence is separate from project source history.

### Cloud-first data policy

Creator data must be cloud-owned, never dependent on a personal Mac. Git holds code
and configuration, not private runtime data or credentials. The persistent launcher
requires an explicit existing Linux data root; local development uses disposable
fixtures. See [DigitalOcean migration](deploy/digitalocean/README.md). Existing local
projects are migration sources, not proof of cloud deployment.

## Source maintenance and discovery

`/sources` and the homepage freshness section include the existing awesome-list
inventory plus game-development skills, VoltAgent's skill directory, Hugging Face
skills, Remotion skills and Open Air. GitHub repository activity and README links
are checked at startup and every six hours by the running Hub process. This is
separate from the hourly Tari Wiki/community directory import.

`GET /api/source-monitoring` reports whether this process has scheduling enabled,
whether a check is running, and its next scheduled check. Set
`CREATOR_HUB_SOURCE_WATCH_MS=0` to disable, or a value of at least 60000 milliseconds
to change the interval. The schedule is completion-based and never overlaps itself.
Stopped servers do not check anything; this is not a hosted 24/7 service. Resume
cloud deployment using the deferred implementation plan when continuous uptime is
required. Credentials use the existing GitHub environment-variable conventions.

Each first check creates a baseline. Later README changes record added/removed
HTTP links; the latest detected change remains visible until another change.
Failures retain the previous successful baseline and mark the monitor stale/failed.
A repository push is an activity signal, not a quality rating. Only the README is
inspected: nested skill files, all branches, releases, and linked sites are not
recursively crawled. New candidates must be reviewed before catalog import or skill
installation. Existing imported resources are not silently replaced.

Public evidence is stored in `cache/source-monitoring.json`; the committed seed is
an initial portable baseline, not a promise of ongoing freshness. Full link diffs
are available in `/api/sources`; the UI shows up to 30 added links per change.
Envato is explicitly a manual licensed source with no automatic update or account
entitlement check. Its signed-in browser, license and generation credit requirements
are documented in `AGENT_START.md`.

## Weekly creator ideas

Create includes New Lore-inspired challenge proposals from a reviewed, repo-owned
insight log. Weekly rotation is free and deterministic; refresh reads the latest log.
See [creator insight maintenance and agent workflow](CREATOR_INSIGHTS.md).

## Game resource lists and design skills

Eight requested GitHub lists now feed categorized resources into Discover, Assets,
Learn and game foundations. The linked design skill repository contributes 62 pinned
bundles to Skills. See [source scope, refresh and reproduction](RESOURCE_LIST_IMPORTS.md).

### Learn category browsing

Learn combines catalog `learn` records with the checked-in repository skill bundles
and native TariSkills. It does not expose private creator drafts or ingest external
instructions as executable skills. Skills open the existing skill pages; lifecycle
labels remain visible and do not imply an engine, integration or deployment is tested.

`server/learningCategories.mjs` owns the creator taxonomy and deterministic matching
against titles, categories, ecosystems and tags. New ingested learning resources are
classified on read. Categories overlap; the total and displayed results deduplicate
by record ID. Unmatched records remain in **More references** and **All resources**.
Review metadata and mapping rules when adding a new discipline; this is rule-based
organization, not an AI review of every resource's contents. Original Tari goal URLs
remain supported under the expandable **Tari learning goals** navigation.

Filters are shareable URL parameters (`category`, `topic`, `learningKind`, `q`,
`ecosystem`, `level`, `format`). Category counts describe the entire library; the
result count reflects active filters. The client reveals 24 results at a time.

Skill marketplace details expand inside the originating card. The same button
opens and closes the labeled region, exposes `aria-expanded`, and remains in
place for keyboard users. Do not restore the old page-bottom detail panel or
programmatic scroll-to-detail behavior; browsing should preserve the selected
card's position. Native guide links, bundle downloads and setup prompts remain
inside the inline detail region.

### Skills category browsing

Skills reuses Learn's `learningCategories.mjs` taxonomy. Public marketplace listings
receive category IDs at read time, including native guides, bundled skills and
published community workflows. The game-design bundle has an explicit discipline
mapping; being an agent skill alone does not classify a listing as AI guidance.
Unmatched listings remain under More references. Categories overlap without
creating duplicate cards. Creator portfolios use the same controls scoped to
visible work. Search, category, type, status and sort are URL parameters; filters
reset the 24-card display limit and close an open card. Inline detail expansion
remains in place. The leaderboard follows the library rather than competing with
category navigation.

## Destination responsibilities

Keep each main tab organized around a distinct user task, not a copy of the index:

| Destination | Why go there? | Primary action |
| --- | --- | --- |
| Home | Join the community and see current activity | Play releases, join challenges |
| Discover | Find existing apps, templates, components and assets | Search, compare, open a resource |
| Learn | Understand a concept or solve a problem | Read guides and references by topic/level/format |
| Skills | Equip an agent with reusable instructions | Review requirements, download a bundle, copy setup prompt |
| Create | Begin a saved project | Blank project, starter selection, guided setup or composition |
| Projects | Continue and manage work already saved | Edit, version, play, share and Riff |

The shared APIs remain broad for agents and integrations. Human-facing Discover excludes
learning records; Learn excludes downloadable skills and recomputes its category counts
and facets accordingly. Legacy Discover `type=learn` links hand off to Learn; Learn
`learningKind=skill` links hand off to Skills, preserving supported search context.
No underlying records or direct detail routes are removed. Learn keeps a Skills handoff
instead of repeating the full skill marketplace. Skills keeps category navigation but
replaces the duplicate subject-tile wall with installation guidance and in-card downloads.

Create opens with a project decision, not another all-resource gallery. Its starter
browser loads after choosing that path (or following a saved starter-filter URL).
Project tools and expandable New Lore ideas follow the selected starting content.
Saving a project remains configuration, not verified execution or deployment.

Directory imports whose source categories explicitly identify tools/editors/libraries
are presented in Discover's Tools & references category instead of Learn. This is a
presentation projection: upstream record types, IDs and provenance remain unchanged.

### Interaction feedback

`HubMotion` owns pointer accents, click rings and creator milestone feedback. It
reuses the installed `canvas-confetti` package. Native cursors and focus rings stay
available; decorative layers never intercept input. Touch devices omit the pointer
comet. The comet uses a bounded canvas trail with a luminous core and drifting sparks,
leaving a clear 10px radius around the native pointer. It fades on idle, pauses over
editable fields, and clears on scroll/blur; no animation loop runs after expiry.
Reduced-motion preferences suppress particles and entrance motion, while
success messages remain readable. The fixed **Effects on/off** control stores only
a browser presentation preference.

Creation/fork/recipe success and saved versions
announce distinct milestones through `creatorMilestones.ts`. Emit only after a
successful response, never on button press or a rejected write. A saved version is
not a deployed app; a published Riff is described as published **in the Hub**.

### First-visit welcome tour

The shared layout opens a four-step native modal on the first visit in a browser:
community introduction, destination map, the create/save/remix loop, and a choice
of where to begin. Skip/Escape closes it without changing the incoming URL. The
footer's **Take the welcome tour** button replays it. Keyboard focus is contained
by the native dialog and moves to each step heading; reduced-motion and the Hub
Effects preference are respected. Quick Search will not stack over another modal.

Completion or skipping stores only a versioned presentation flag
(`creator-hub:welcome:v1`) in browser storage. This is not an account record or
project data. Another browser sees the tour again; blocked storage permits the
tour but cannot remember completion across reloads. No analytics or credentials
are collected and the tour does not create a project or execute an agent.

### Challenges destination

`/challenges` owns weekly prompts, the Council monthly contest, submissions,
calendar and past editions. Home has only a compact invitation. The primary nav
and welcome tour point to this destination. Projects remain canonical and can
still appear in Discover; challenge entries reference them rather than duplicate
saved projects.

The weekly gallery reads `GET /api/challenges/submissions`, which exposes entry
summaries, project IDs, pinned revisions, evidence URLs, timestamps and review
status, excluding creator identity/credentials. It refreshes after submission.
Current project covers are labeled separately from pinned submission evidence.
Deleted/unavailable projects do not get broken project links. Monthly entries
use the existing `september-contest-2026` catalog tag, with the official forum
linked as the authoritative submission thread; the Hub does not claim this is a
complete or automatically verified forum mirror. Future contest editions need
updated contest configuration and catalog tags.

## Creator Journal and Ootle launch

`/blog` serves reviewed, Git-backed articles with distinct animated covers. Direct
article URLs include server-rendered copy, metadata and BlogPosting structured data.
`/ootle` is the shared launch/news/event signup destination. The header countdown and
homepage invitation target **2026-11-11 11:11 UTC** (configured in `content/launch.json`).

See [editorial backlog and cadence](content/EDITORIAL_BACKLOG.md) and
[provider connection contract](content/SUBSCRIPTIONS.md). No subscriber data is stored
in this repository or on disk. Without provider configuration the form deliberately
shows unavailable and collects nothing. Configure `SUBSCRIPTION_WEBHOOK_URL`,
`SUBSCRIPTION_WEBHOOK_TOKEN` and `SUBSCRIPTION_PRIVACY_URL` server-side; verify cloud
confirmation and unsubscribe before launch. `PUBLIC_SITE_URL` enables canonical
URLs, `/blog/feed.xml` and `/blog/sitemap.xml` on the deployed domain.

Run `node scripts/refresh-journal.mjs` to prepare source-derived drafts. The weekly
GitHub Action uploads a review artifact, not a public post. Publish by reviewing and
committing an article to `content/blog/`; private source logs never enter articles.

### Daily Spark trivia

The homepage daily trivia hero awards free preview Sparks, with a server-timed question,
one earned multiplier spin, an optional Super Spin after a 5× wedge, and a header balance. See [Daily Spark design, limitations and
checks](../DAILY_SPARK.md) and [Preferred Super Spin](../DAILY_SPARK_SUPER_SPIN.md). Browser identity and a single-process prototype ledger are
implemented; verified accounts, human verification and cloud balances are deferred.

The header launch ticket displays days, hours, minutes and live seconds with stable-width
animated digit changes. Reduced motion and Effects off disable decorative motion while
keeping the clock accurate. The ticket links to `/ootle`; it does not indicate network availability.

### Games

There are no published games yet. The earlier curated games and their publish script
were removed in the 2026-09-26 fresh start (they remain in the tari-growth repo for
reference only); `GET /api/games` returns empty lists. New creation tooling is planned in
[docs/PLAN.md](../../docs/PLAN.md). See [the publication checklist](../GAME_PUBLICATION.md)
for how an original game is handed off for review.
