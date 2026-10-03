# September 2026 contest profiles

Reviewed September 22, 2026. Source: [complete September thread](https://community.tari.com/t/september-contest-thread/324), with [contest rules](https://community.tari.com/t/ootle-launch-date-and-launch-contest-rules/323).

## Coverage and identity

The full Discourse post stream contained 14 accessible posts. Eight are submissions: TariOrg (n0izn0iz), Private Ballot (GSXRspartan), Signal Vault (Og.boy), Ootle Pay (Matteo), ShadowTix (Zvovanz), Legacy Vault (zhazha), Sapient (0xhra), and Ootle Surveys (Meowmancer). Gaps in post numbering are not additional accessible entries. Discussion, deployment updates and refund corrections are linked as context, not imported as additional projects.

Canonical records live in `hub/data/contests/september-2026.json`. `server/contestEntries.mjs` overlays this curated snapshot on the ingested catalog, preserving existing descriptions and original preview media. Four existing canonical profiles are enriched, and four missing profiles are added. Repeat enrichment does not duplicate them. Future wiki ingests cannot erase the contest association. This is a dated review, not a live forum subscription: refresh the complete post stream, update source revisions and review new entries before changing the registry.

Imported creator pages use `forum-*` identifiers and public forum attribution. They are not accounts created or claimed on behalf of those people. They have no edit credentials and are excluded from download rankings. Existing user profile authorization remains unchanged. Their portfolios link to the project, original entry and forum identity. Do not invent contributor verification, play counts, completed transactions or prizes.

## Submission checks

Profiles show public code, description, presence of a payment address, social announcement and the observed license. Payment addresses remain in the original forum posts; only presence is retained. GitHub license metadata was reviewed; Private Ballot's dual MIT/Apache-2.0 declaration comes from its public submission/README rather than GitHub's null license field. ShadowTix's license is unconfirmed, its reviewed entry has no social announcement link, and its donation address needs confirmation as the intended prize address.

The Council must still decide originality, team ownership, contestant eligibility and awards. September permits earlier work under the published exception. The requirement to avoid other entries' code still applies. A profile is not an endorsement, security audit, production-readiness certificate or completed contest validation. No forum post, social post or payment was sent by this import.

## Capture and reproduction

Eight unique 12-second webpage recordings were made using `capture/capture-apps.mjs`. Five show public websites; Private Ballot, Signal Vault and Ootle Surveys show their repository/README because they have no hosted demo in this reviewed set. All are labeled recorded webpages, not gameplay. Four spaced frames per clip were reviewed for the correct project, readable content and actual scroll movement. No wallet or financial interaction was performed. These captures do not establish successful app execution.

`capture/september-2026-review.json` records exact resource IDs, source URLs, immutable media names and SHA-256 hashes. Small source-specific poster images and their seed index are committed. MP4s are runtime artifacts in `hub/data/previews` and are available in the current local preview; they are not committed or a remote deployment. Preserve these artifacts through the deployment media store. A fresh checkout displays the committed posters until matching clips are installed or new captures reviewed.

To reproduce, create a JSON array from each registry entry's title and `demoUrl || repoUrl`, using `{ "name": "Title", "url": "https://public-source" }`. Run `node creator-hub/capture/capture-apps.mjs INPUT_JSON OUTPUT_DIRECTORY`. Review every resulting clip before publishing. Copy approved media to the runtime previews directory with immutable hash filenames; add exact resource-ID mappings to its index atomically. Update the committed capture review and seed posters. New recordings have new hashes and need a fresh review. Never substitute one entry's imagery for another.

## Verification and handoff

The Projects page has an imported contest section, Discover supports `q=september-contest-2026`, the monthly contest panel links to those entries, and each resource detail page carries its submission checklist. Creator pages display their contest portfolio.

Regression coverage checks eight unique profiles, preservation of ingested content, idempotent enrichment, creator attribution and the missing social link. The preview regression now expects Private Ballot's reviewed repository poster while continuing to reject the unrelated generic Caravel seed cover. Browser verification checks all eight playable media URLs, advancing visible video time, mobile overflow, the ShadowTix checklist and Meowmancer's portfolio. This change does not create fabricated playable builds or forkable release histories for third-party projects.
