---
source_issue: 189
recorded_date: 2026-09-23
status: historical-audit-proposals-not-implementation
---

# Ootle Lobby repo skill/instruction audit

**Main tip:** `6a761c2`  
**Date:** 2026-09-23 ET  
**Scope:** Read-only consolidation of the delivered role packets in `incoming/`.

## Constraints

- No workers, new bots, paid generation, merge, deploy, schedules, or product mutation.
- PR #186 and wheel worker `bc-e2a1bfc0` were left undisturbed.
- Reddit, Noodlerack, Puzzle Lair, and Fanous references in `COMMUNITY_DESIGN_RESEARCH.md` remain hypotheses/public-text leads, not verified skills, playtest results, retention evidence, or market proof.
- This report is a consolidation artifact. It does not authorize or apply any proposed edit.

## Coverage matrix

`DELIVERED` means the corresponding incoming audit artifact was present at write time. It does not mean the proposed patch was accepted, merged, or runtime-tested. The evidence level below describes the proposed edit in that packet; supporting product observations are called out separately.

| Role | Artifact path | Revision claimed | One-line lesson | Proposed edit path | Evidence level | Status |
|---|---|---|---|---|---|---|
| Producer | `incoming/producer.md` | `6a761c2` | Coordinator approval is not a coding gate; preserve evidence and autonomy boundaries. | `creator-hub/agents/team.json`; `creator-hub/agents/producer.md` | proposed | DELIVERED |
| Game Design | `incoming/game-design.md` | `6a761c2` | Mechanics/economy correctness is not creative/feel acceptance; preserve equal-arc readability and distinct land-5x beats. | `creator-hub/agents/game-design.md`; `creator-hub/agents/team.json` | proposed | DELIVERED |
| Game Assets | `incoming/game-assets.md` | `6a761c2` | Material hierarchy, native-scale outcomes, headphone checks, and provenance beat glow-only or text-only acceptance. | `creator-hub/agents/game-assets.md`; `creator-hub/agents/team.json`; `creator-hub/daily-spark/ASSET_PROVENANCE.md` | proposed | DELIVERED |
| Blueprints | `incoming/blueprints.md` | `6a761c2` | Hub design graphs and Unreal Blueprints are different surfaces; design edges do not execute or pay. | `creator-hub/agents/blueprints.md` | proposed | DELIVERED |
| Iteration | `incoming/iteration.md` | `6a761c2` | A reusable lesson needs the §7 handoff and a checked/playable revision with an observed result. | `creator-hub/agents/iteration.md` | proposed | DELIVERED |
| Economic Design | `incoming/economic-design.md` | `6a761c2` | Odds, settlement, ledger, and idempotency acceptance are separate from wheel presentation and “feels lucky.” | `creator-hub/agents/economic-design.md`; `creator-hub/agents/team.json` | proposed | DELIVERED |
| Game Genres | `incoming/game-genres.md` | `6a761c2` | Classify first and load at most one fitting genre; trivia/wheel/gacha is not automatically board puzzle. | `creator-hub/agents/game-genres.md`; `creator-hub/agents/team.json` | proposed | DELIVERED |
| Capture & Sizzle | `incoming/capture-sizzle.md` | `6a761c2` | Stills and reduced-motion heroes do not prove the animated Daily Spark loop; label plan, clip, export, and playback separately. | `creator-hub/agents/capture-sizzle.md` | proposed | DELIVERED |
| QA & Accessibility | `incoming/qa-accessibility.md` | `6a761c2` | A named crop is not full-viewport evidence; state-crop and render bars must stay separate. | `creator-hub/agents/qa-accessibility.md` | proposed | DELIVERED |
| Story & Narrative | `incoming/story-narrative.md` | `6a761c2` | BRAND rows are voice direction; multi-state reward UI needs a state-to-line map, stable IDs, tiers, and plain adjacent copy. | `creator-hub/agents/story-narrative.md`; `creator-hub/agents/team.json` | proposed | DELIVERED |
| Player Experience | `incoming/playtest-player.md` | `6a761c2` | Source review, worker URLs, and checklists are not play evidence; unreachable builds stay NOT PLAYED. | `creator-hub/agents/playtest-player.md`; `creator-hub/agents/team.json` | proposed | DELIVERED |
| Riff Scout | `incoming/remix-scout.md` | `6a761c2` | Map claimed Riff steps to available/inaccessible/proposed Studio capabilities; design editability is not playable preview. | `creator-hub/agents/remix-scout.md` | proposed | DELIVERED |
| Achievement & Rewards | `incoming/achievement-rewards.md` | `6a761c2` | Recognition must follow an observable evidence object; decorative constellation progress and Sparks must not imply verified achievement or money. | `creator-hub/ACHIEVEMENTS.md` | proposed | DELIVERED |
| Marketing | `incoming/marketing.md` | `6a761c2` | Review Home CTA hierarchy in context and never turn community anecdotes into traffic, conversion, or attribution proof. | `creator-hub/agents/marketing.md` | proposed | DELIVERED |
| SEO & Discovery | `incoming/seo.md` | `6a761c2` | Curated New Lore and community questions are inspiration, not keyword volume, ranking, or indexability evidence. | `creator-hub/agents/seo.md`; `creator-hub/agents/team.json` | proposed | DELIVERED |
| Onboarding Experience | `incoming/onboarding-experience.md` | `6a761c2` | Fix the stale first-session identity before inventing flows or tracking; preserve the existing welcome storage key. | `creator-hub/hub/client/src/components/WelcomeTour.tsx` | proposed | DELIVERED |
| Analytics | `incoming/analytics.md` | `6a761c2` | Event names and completion rates need a versioned dictionary, unit, consent, and verification level; votes are not usage. | `creator-hub/agents/team.json`; `creator-hub/agents/analytics.md` | proposed | DELIVERED |
| Brand Voice | `incoming/brand-voice.md` | `6a761c2` | STATE CROP VERIFIED is not RENDER VERIFIED; hierarchy requires integrated desktop and narrow-mobile review. | `creator-hub/agents/BRAND_REVIEW.md`; `creator-hub/agents/brand-voice.md` | proposed | DELIVERED |
| Grok / Daily Spark design owner | `incoming/grok-daily-spark.md` | `6a761c2` | A still packet is stills-only unless the cited presentation code and real motion evidence were actually applied. | `creator-hub/agents/CREATIVE_OPERATING_RULES.md` | proposed | DELIVERED |

## Evidence boundary: proposals versus tested corrections

All proposed path changes in the matrix are **proposed and unmerged**. The packets do contain bounded supporting observations, which must not be mistaken for tested instruction patches:

- Economic Design cites the prior tested Super Spin ACCEPT at `dd73c4b`; this supports odds/settlement honesty, not a tested doc edit.
- Game Design cites a tested/prototyped WON REVISE for visually countable arcs and the land-5x handoff; no human fun stamp was claimed.
- Game Assets cites prior WON REVISE still-frame evidence; audio audition, Envato access, and runtime verification were not done.
- Grok cites prior creative REJECT / Design REVISE evidence; stills were not promoted to creative ACCEPT.
- QA/Brand Voice measured available files as state/hero crops and correctly kept them below full-viewport RENDER VERIFIED.
- Onboarding source-checked the stale `WELCOME TO CREATOR HUB` chrome; the proposed rename was not rendered or playtested.

No source-read, still-frame, worker transcript, or prior branch artifact upgrades an untested instruction edit into a tested correction. In particular, do not turn Reddit, Noodlerack, Puzzle Lair, or Fanous into verified skills. Do not turn “community interest,” curated New Lore, or social votes into usage, retention, SEO, conversion, or market evidence.

## Consolidated prioritized patch proposal

### P0 — one shared evidence-and-read packet

1. **Batch the shared requiredReads update as one change set.** Nearly every packet identified the same lag: `creator-hub/agents/CREATIVE_OPERATING_RULES.md` and `creator-hub/agents/COMMUNITY_DESIGN_RESEARCH.md` are audit-wide required reads but are absent from many role packets and matching `creator-hub/agents/team.json` arrays. Update the relevant `team.json` role arrays and the matching role Markdown “Read before accepting” sections together, rather than issuing repetitive partial edits. The incoming proposals explicitly name Producer, Analytics, Economic Design, Game Assets, Game Design, Game Genres, Player Experience, SEO, Story, Brand Voice, Capture & Sizzle, Marketing, and Riff Scout; apply only to the role entries/paths named in those packets. Preserve the research label **hypotheses only**.
2. **Install a common evidence vocabulary.** Add the proposed `STATE CROP VERIFIED` versus `RENDER VERIFIED` meanings to `creator-hub/agents/BRAND_REVIEW.md` and `creator-hub/agents/qa-accessibility.md`, including measured viewport/path/tip requirements and the rule that source review, filenames, crops, and attractive stills cannot pass the full-page bar. This is the clearest cross-role protection against evidence inflation.
3. **Keep experiential claims gated.** Align `creator-hub/agents/playtest-player.md`, `creator-hub/agents/game-design.md`, `creator-hub/agents/capture-sizzle.md`, and `creator-hub/agents/game-assets.md` with the existing NOT PLAYED, motion-capture, reduced-motion, and headphone limits: no human-fun, audio, or animated-loop acceptance without the corresponding reachable/runtime evidence.
4. **Protect economic truth while presentation changes proceed.** Align `creator-hub/agents/economic-design.md` and `creator-hub/agents/game-design.md` around authoritative draw odds, settlement/idempotency, equal-arc readability, and separate creative/feel stamps. Do not modify PR #186 in this audit.

### P1 — role-specific correctness and path-drift fixes

- **Blueprint surface boundary:** `creator-hub/agents/blueprints.md` should name `creator-hub/hub/shared/workflow.mjs`, distinguish Hub `design`/`comfy` graphs from Unreal compile/PIE evidence, and label BP-01–05 study items proposed.
- **Capture acceptance:** `creator-hub/agents/capture-sizzle.md` should require anticipation → reveal tier → settle and settled-ledger evidence for a real Daily Spark capture; stills remain shot requests/claim heroes, not motion proof.
- **Design/assets acceptance:** `creator-hub/agents/game-design.md` and `creator-hub/agents/game-assets.md` should encode countable arcs, importance-tier beats, native-scale frames, headphone audition, and the distinction between `VIDEO_PREVIEW_POLICY` cover rules and Daily Spark chrome. The missing `creator-hub/daily-spark/ASSET_PROVENANCE.md` is a documented gap, not permission to invent a provenance record.
- **Analytics/SEO honesty:** `creator-hub/agents/analytics.md` should require a versioned event dictionary with unit, consent, and verification level; `creator-hub/agents/seo.md` should require public-deployment evidence and keep curated New Lore/community research out of metrics claims.
- **Story/marketing/achievement boundaries:** `creator-hub/agents/story-narrative.md` should require a state→line map and stable IDs; `creator-hub/agents/marketing.md` should name primary/secondary CTA and hypothesis-label community references; `creator-hub/ACHIEVEMENTS.md` should require evidence objects before decorative progress and keep contributor recognition separate from non-monetary Sparks.
- **Genre/remix boundaries:** `creator-hub/agents/game-genres.md` should make puzzle conditional after router classification; `creator-hub/agents/remix-scout.md` should map Studio/GAME_PUBLICATION capability status instead of claiming Noodlerack-style preview/share.
- **Iteration/onboarding/design-owner receipts:** `creator-hub/agents/iteration.md` should cross-link the §7 minimum handoff; `creator-hub/hub/client/src/components/WelcomeTour.tsx` has the proposed stale-chrome rename while preserving `creator-hub:welcome:v1`; `creator-hub/agents/CREATIVE_OPERATING_RULES.md` has the proposed Daily Spark tip/branch SHA and stills-only/motion-captured receipt.

### P2 — follow-on verification and optional companion docs

1. Re-run the relevant source checks after any accepted docs PR; then obtain the missing evidence bars in order: reachable revision, full desktop/narrow viewport, reduced-motion/touch/keyboard, real motion, headphone audio, and human play/fun.
2. If authorized separately, add the proposed companion wording to `creator-hub/skills/economy-simulation/SKILL.md`, `creator-hub/GAME_PUBLICATION.md`, `skills/vendor/gamedev/skills/genres/puzzle/SKILL.md`, and `creator-hub/BRAND.md` only as described in the incoming packets; do not broaden vendor skills or claim implementation.
3. Resolve documented source gaps before relying on them: `creator-hub/daily-spark/ASSET_PROVENANCE.md` and `creator-hub/DAILY_SPARK_SUPER_SPIN.md` were reported absent on main `6a761c2`; `creator-hub/daily-spark/BUILD_PLAN.md` and `sparkPresentation.ts` were reported on the PR tip, not main. These are verification/follow-up items, not reasons to disturb PR #186.

## Collective unreviewed / inaccessible gaps

- No interactive play of Ootle Lobby/Daily Spark, no human fun or cold-session acceptance, and no reachable revision for the Player Experience pass.
- No full-viewport Home or `/create` render; available brand files were crops, and `/workspace/jam-handoff/brand-frames/` was empty at the cited checks.
- No independent browser, keyboard, touch, reduced-motion, performance-profiler, or headphone pass; localhost/other-agent worker URLs were not treated as accessible.
- No real Daily Spark motion capture or playback proof; no live audio audition; no Envato/Kenney/Freesound access.
- No live analytics event files, production data-warehouse actuals, Search Console, public crawl, ranking/traffic/backlink figures, or subscription webhook delivery proof.
- No interactive Studio one-node consequence preview → undo → fork-share trial; no interactive Noodlerack, Puzzle Lair, or Fanous play.
- `creator-hub/daily-spark/ASSET_PROVENANCE.md` was reported missing on main at write time; `creator-hub/DAILY_SPARK_SUPER_SPIN.md` was reported 404 on main. `game-assets.md` itself was **present in `incoming/` at write time and is DELIVERED**, so it is not a missing audit artifact.
- Some cited files were rate-limited, only known from earlier reads, or only present on PR/worker tips. Those claims remain labeled in their source packets and are not upgraded here.

## Consolidation result

Nineteen incoming role slices were present and delivered. Zero incoming slices were missing. The audit report and refreshed status are workspace handoff artifacts only; no repository review file was written, no worker was launched, and PR #186 was not touched.
