# Ootle Lobby specialist team

**Candidate workflow — verification status lives in [TRIAL_REPORT.md](TRIAL_REPORT.md).**

Initial complementary roles: Game Design, Blueprints, Game Assets (including art/audio/VFX), Iteration, Economic Design, Game Genres, Capture & Sizzle, Producer, independent QA & Accessibility, and Story & Narrative (game fiction, dialogue and marketing scripts), Player Experience (experiential playtests), and Riff Scout (evidence-based fork briefs), and Achievement & Rewards (verified community contributions and progression), Marketing (positioning and campaigns), and SEO & Discovery (search intent and technical discoverability), Onboarding Experience (first success and recovery), and Analytics (measurement and experiment evidence). These are persistent agent instructions, not trained models or guarantees of expertise.

## Start in a fresh environment

1. Obtain authorized access to this private repository. Clone it, fetch the task revision, and follow `AGENTS.md` and `creator-hub/hub/AGENT_START.md`. No access to the original Mac is required.
2. Run `python3 creator-hub/agents/team.py check` from the repository root. It checks the manifest and referenced instruction files without installing software or launching bots.
3. In Grok Bot, create a new Bot called **Jam · Producer**. Put `producer.md` into its instructions and send the output of `python3 creator-hub/agents/team.py kickoff`. If it has no persistent instruction field, send the full role as the first message and ask it to preserve the role through its supported persona tool. Verify the saved configuration.
4. Ask the Producer to inspect its actual tools. Our local Grok reported `CreateAgent`, `UpdateAgent`, `SendToAgent`, and `CreateChannel`; tool availability and names may differ in another account/version. Never pretend that a tool exists. If unavailable, manually create one bot per role and relay artifact handoffs through the Producer.
5. Create or reuse the non-producer bots listed in the manifest. Use each complete role Markdown, including the common contract. Reuse matching bots instead of duplicating them. Inspect channel capacity. Our Grok version caps a room at six members: use Core (Producer, Design, Genres, Blueprints, Economy, QA) and Support (Producer, Assets, Iteration, Capture, QA), with Producer relaying versioned artifacts between rooms. Return names/IDs and a capability receipt before implementation.
6. Give the Producer a project task packet using the template below. Activate only the specialists that help this task. Having a specialist roster does not require calling every role for every edit.

For another agent harness, use these same Markdown files as role instructions and its supported subagent mechanism. Persistent Grok bots, Codex subagents and cloud coding workers are different execution surfaces; document which actually did the work.

## Access and cost preflight

Repo access must be checked separately for each worker. Verify reading, committing, pushing and PR creation as separate capabilities: in this trial Grok could read/review through its connector but could not commit file contents; only the cloud worker had a working write path. Do not describe a connection as writable until the intended write capability is confirmed. A cloud worker cannot access your localhost, local files or signed-in desktop browser. Supply a reachable preview or have it start its own.

Hugging Face, Envato, fal, OpenRouter and voice providers are optional task dependencies, not universal prerequisites. Select only what the project needs. Have the user configure credentials privately. An Envato license does not establish cloud browser access or permission to redistribute stock source files. If unavailable, make a precise asset request or choose an approved accessible alternative.

Read an actual clock for deadline checks; do not infer elapsed time from a prompt. Set a numeric timebox, maximum concurrent workers, generation/render allowance and stop condition. Default trial: one implementation worker, no paid media generation, one short proof, no deployment. Record unknown provider usage as unknown; zero generation calls is not zero cost. Stop additional retries at the limit and preserve the partial handoff.

Only the Producer allocates cloud workers. Specialists, including QA, must use existing execution tools or report missing execution access. Independent review does not authorize an extra cloud worker. Keep a worker ledger with IDs, owner, start/stop time and terminal state; stop out-of-scope runs immediately. Prompt rules are not a technical spending limit: configure provider-side limits where available. This trial violated its one-worker cap, so budget control has not graduated.

## Task packet

```text
Project / repository / exact revision:
Player promise and smallest observable success:
Engine, pinned versions and target devices:
Allowed files, excluded files and one owner per file:
Existing assets, starting template and required skills:
Reachable preview / how to run locally:
Budget: deadline, worker cap, generation/render cap:
Deliverables and acceptance checks:
Authorized actions (commit/PR/publish/deploy separately):
Who reviews creative quality and what needs their feedback:
```

## Coordination contract

Use [Shared coordination and delivery](COORDINATION.md) for cross-agent receipts,
blocker escalation and source-to-preview reconciliation.

Codex, Producer and assigned creative reviewers must apply
[Creative operating rules](CREATIVE_OPERATING_RULES.md). Include this link in
relevant task packets and require an applied decision plus evidence in the handoff.

Producer → Genres + Design + Story (when relevant) → Blueprint/Assets/Economy as needed → single implementation owner → QA → Iteration → QA rerun → Capture (after gameplay works) → Producer handoff.

Collect required design/genre/contract inputs before starting the implementation worker. Batch the accepted inputs into one kickoff and subsequent corrections into one review packet. Explicitly address each assigned bot; our trial found a channel announcement alone did not reliably produce immediate role outputs. Ask for the artifact body or reachable file, not merely readiness. Routine authorized internal handoffs need no extra user permission.

Parallelize only independent artifacts. Each handoff includes artifact path, revision, assumptions, checks, unresolved issues and next owner. Receiver explicitly accepts or rejects it. Preserve author, source revision, checksum where applicable, and destination path. The original specialist must approve the integrated bytes or any deliberate translation. A worker substitute is not the specialist’s work, and worker self-review is not independent QA. Decisions belong in the repo; messages are not the sole copy. Each specialist cites the exact skill read and a specific decision it changed. Reject irrelevant catalog matches, especially wrong engines.

QA may block a release but must not quietly redesign it. Iteration proposes corrections tied to evidence. The Producer resolves ownership conflicts and integrates only authorized work. A screenshot, source inspection or unit test cannot prove sound quality or human enjoyment.

Use [team.json](team.json) as the portable role manifest and the named Markdown files as ready-to-paste prompts. `team.py check` verifies they stay synchronized.

## Graduation gates

For reference-led visual and interaction reviews, use
[Community design research](COMMUNITY_DESIGN_RESEARCH.md). Turn sources into one
bounded playable comparison; do not equate reference collection with improvement.

- Real separate specialists exist, with intended personas and access verified.
- Every activated role demonstrates actual reading/application, not a generic acknowledgment.
- At least one cross-role artifact is received, checked and corrected.
- Model and graph negative tests pass; independent QA rejects false execution/publication claims.
- Actual game UI, touch/keyboard and reduced-motion checks run on a representative build.
- Capture specialist produces and checks a short real clip before claiming video production proven; audio requires listening.
- Human reviewer assesses fun and aesthetic quality; credit/time savings require measured comparisons.

A partial trial earns only a partial status. Do not label the entire team production-proven because the roster exists or a reward-model test passes.

## Add specialists when a real gap appears

The user authorizes the coordinating agent to create useful additional specialists as gaps are identified. Producer can request them directly; routine additions within existing access and task budgets need no repeat user confirmation. This is an extensible roster, not a fixed nine-role ceiling.

Before requesting one, inspect the existing roles and resource/skill catalog. Prefer adding a relevant skill to an existing role when responsibility fits. Distinguish missing expertise from missing credentials, execution access, stale artifacts or unclear ownership: another persona alone cannot fix those.

Send the coordinating agent a compact **SPECIALIST_REQUEST** in the active coordination exchange:

- Gap, affected task and concrete failure or upcoming requirement.
- Proposed role and why an existing owner cannot reasonably cover it.
- Relevant repo skill/resource paths; required tools and actual access status.
- One bounded deliverable, file ownership and handoff recipients.
- Representative acceptance check and budget impact within the current limits.

The coordinating agent selects or creates the role, adds its complete Markdown and manifest entry, runs `team.py check`, creates the persistent bot, verifies its saved instructions and records its roster ID and status. Run a small relevant trial before calling it qualified. Producer acknowledges the new owner and channels; preserve channel capacity limits. Use the existing task handoff to record requested → created → trialed → qualified (only for tested scope), or deferred with reason.

A specialist persona is not another cloud worker. Additions do not authorize extra paid workers, wider access, new subscriptions, generation, deployment or a restart of a closed trial. Producer routes the request to the coordinating agent rather than recursively spawning workers. If the coordinator is unavailable, retain the request in the task handoff for its next check-in; do not pretend a UI message guarantees automated delivery.

<a id="playtest-to-remix-pairing"></a>
## Playtest to Riff pairing

Player Experience observes the original and identifies friction/replay opportunities. Riff Scout proposes a distinct fork grounded in that evidence. Producer selects one bounded brief; Design/Genres refine it, Blueprints scaffold it, Story/Assets establish its identity, Economy reviews reward changes, and the assigned implementation owner builds it. Player Experience compares both builds, QA checks correctness, and Capture records only the verified playable result. Both new roles remain unqualified for actual play until an interactive trial is recorded.

## Community incentive ownership

Achievement & Rewards selects desired outcomes, evidence and eligibility. Economic Design validates reward quantities and sustainability; QA tests duplicates and abuse; Player Experience reviews clarity and accessibility. Human, agent and team contributions require honest attribution. Proposed incentives do not activate rewards or payouts.

## Marketing, story and search ownership

Marketing owns who the campaign serves, its promise, distribution plan and success measure. Story owns narrative and script craft; Capture owns actual video production. SEO owns search intent, content architecture and technical discoverability. They reuse dated New Lore inputs when available; access and search metrics must never be fabricated. Onboarding does not authorize outbound communication, paid campaigns or automatic publication.

## Continuous onboarding review

Onboarding Experience and Analytics review available submitted feedback and authorized aggregate behavior evidence in bounded daily check-ins coordinated by Codex. New findings become one prioritized hypothesis with baseline, owner and verification plan; implementation uses the existing Producer-managed Cursor PR path and team peer review before merge, without requiring Codex approval. No new finding means no new build or repeated status chatter. Missing data is recorded as a gap, not fabricated behavior. A persistent bot alone is not a scheduler; the actual enabled schedule and access limitations must be recorded in the onboarding receipt.

## Brand voice review

Use `brand-voice.md` for cross-route editorial QA and `BRAND_REVIEW.md` for calibration and evidence coverage. This role coordinates with Story, Marketing, Assets and QA; creating it is not qualification. Producer integrates corrections without per-line coordinator approval.

## Delivery autonomy: prototype to playable review

Within an authorized task and its worker/budget limits, Producer owns prototype
corrections, implementation, specialist review and delivery of a testable revision.
Do not require another Codex permission between those steps. A specific temporary
hold still applies until explicitly lifted; report it as a blocker rather than idle
progress. Merge review is separate from permission to implement. Batch actionable
review findings; avoid repeated approval messages without artifact changes. Deliver
preview/artifact links and exact revisions early, with unverified states disclosed.
A whole-site audit does not block an unrelated scoped game iteration.

2026-09-23: the Daily Spark prototype-only hold is lifted for the existing PR186
worker after Design/Assets defects are corrected. At most one active implementation
worker; no extra paid asset generation or expanded access. Preserve the Create fix
and restored project/media library when integrating. User creative acceptance and
team peer review remain required; Codex is not a mandatory merge approver. The team may merge authorized changes via existing Cursor access and must report the merge SHA and verified serving build.

## Specialist access setup

Use [SPECIALIST_SETUP.md](SPECIALIST_SETUP.md) to configure and verify each role’s actual execution tools and scoped credentials. Keep secret values out of role chats and repository records.
