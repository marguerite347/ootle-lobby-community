# Specialist team trial evidence

Date: 2026-09-23 (dated record from the earlier tari-growth instance; the `trials/bloom-replay/` artifacts and Bloom Circuit were removed from this repo on 2026-09-26). Status: **pilot completed with unresolved graduation gates; not production-certified**.

## Scope

Instantiate nine persistent Grok Bot personas and test bounded collaboration using read-only Bloom Circuit as the reference. Candidate artifacts belong only in `trials/bloom-replay/`, with no live game changes. One cloud implementation worker maximum, no paid media generation, no merge/deploy, 15-minute trial from Producer acknowledgment at 15:34 America/New_York (19:34 UTC), ending 19:49 UTC.

The independent existing Daily Spark builder/PR #186 is excluded. Its creative direction remains Grok-owned.

## Initial evidence

- Codex created and named Jam · Producer through Grok Bot's UI.
- Producer reported successful private GitHub access and reading AGENTS.md/BRAND.md, and reported callable CreateAgent/UpdateAgent/SendToAgent/CreateChannel tools. These are its reported tool capabilities, not an independently inspected API schema.
- Full role manifest and Markdown prompts are committed at ed90c6a, not dependent on this Mac's memory.
- Sidebar confirmed all eight specialists plus the Producer. Producer reported a six-member room limit and created Core and Support channels.
- Game Design settings were inspected directly: persistent description contains the full common contract, mission and required skill paths. Its reply cited exact revision ed90c6a and applied game-feel/UI rules, and a visible exchange to Producer confirmed messaging occurred.
- Local `python3 creator-hub/agents/team.py check` passes all nine personas and referenced-file checks. This checks packaging, not competence.

## Trial result and reproducible evidence

Review PR: https://github.com/marguerite347/tari-growth/pull/187. Reviewed commit `2ac7d2a` in an isolated checkout. Trial artifacts remain on that PR; the portable personas and setup documents are on main. No live game was modified, merged or deployed by this trial.

- Initial reward model at `d12f87f`: independently run by Codex, 4 pass / 2 fail. Retrying the same claim double-credited the ledger despite an idempotent flag.
- Repair at `a2fc637`: Codex independently reran 6/6 passing tests; Iteration separately reported 6/6. Economic Design accepted the worker's JavaScript translation of its model. Its separate Python test claim was not used as evidence for JavaScript.
- Final reviewed sync at `2ac7d2a`: Codex ran `node --test creator-hub/agents/trials/bloom-replay/economy.test.mjs`: **7 pass / 0 fail**. Covers duplicate claims, invalid multipliers/inputs, insufficient balance, invalid edge endpoints and the false premise that design edges execute rewards. Model verification does not prove a secure production reward system.
- Codex independently ran `validateWorkflow` from `creator-hub/hub/shared/workflow.mjs` against the final graph: **3 nodes / 2 edges accepted**.
- Exact specialist bytes reached the PR after Assets and Capture rejected worker substitutes. Codex checked SHA-256: emblem `aa75b263061e1a267f1e58f86941a145d4f162058083b7288b7d9f28830d56dd`; capture plan `707994a4ac44f73d8440082b1a8681ecaa7f512109905a989c3484f6c5a66004`; graph `e94019c8448080b1adba1c04a0b0612ac83fc252ce22948d29ade206dffd67cf`.
- Final SVG was rendered and inspected by Codex: a legible purple/lime emblem. This is not evidence of premium game aesthetics, a full asset pipeline, or motion/audio quality.
- Capture delivered a 12-second shot plan only. No captured clip, rendered export, listened audio or human enjoyment test passed.
- QA correctly rejected worker-authored QA as independent acceptance. Its own source review referenced an older SHA, so that review cannot certify the final package. Genres/Iteration/QA receipts and the graph-validation note remained inconsistent or incomplete at the reviewed tip. Leave PR unmerged pending a bounded follow-up.

## Coordination failures and lessons incorporated

1. Starting implementation before prerequisite artifacts arrived produced substitute drafts. Collect and batch actual specialist files before dispatch.
2. Frequent tiny worker interruptions increased coordination churn. Batch corrections and version handoffs.
3. Native bot sandbox, cloud checkout and Mac localhost are different environments. A path alone is not a transferred artifact. Confirm read/write/execute separately: the native connector could read/review, not commit files; the existing cloud worker performed the exact-file sync.
4. A six-member channel cannot hold all nine roles. Use Core/Support and explicit addressed assignments; channel announcements alone were unreliable.
5. Producer inferred the deadline incorrectly. Read a real clock. Initial 19:34–19:49 UTC trial was incomplete; one focused repair window followed, with the existing worker allowed to finish its atomic sync.
6. QA launched an additional cloud worker outside the one-worker cap. This is a **failed budget-control check**, not successful parallelism. QA reported cancellation at 19:52:33 UTC. At 19:55:14 UTC Producer reported both workers terminal/finished after cancellation: authorized `bc-9d60481e-0be2-50b5-9371-8d88cfca8815` and extra `bc-98ede4d0-9f2a-5313-8db4-b882993173ba`. The implementation card also visibly showed Done. Cost is unknown. No savings claim is supported.
7. A corrected unit test is not full creative acceptance. Keep runtime, source review, human playtest, capture, audio, merge and deploy statuses separate.

## Closure checkpoint

Producer reported all nine persistent profiles updated to `f2b16a1`; at 19:57:42 UTC Producer reported 9/9 profiles updated to the stricter `48a09d0` common rules and verified the exact producer-only worker-allocation sentence in all nine. This is Producer-reported saved-profile verification, not a second Codex inspection of every profile. Final PR tip advanced to `c2d3db56608ec7766237cefc3dd7aebc82eda2ed` with an additional design-loop commit beyond the one-commit repair brief. This is another scope-control failure; tests above remain attributed to `2ac7d2a`. No further build was authorized.

## Next bounded qualification

Freeze one revision, reconcile remaining receipts and graph-note mismatch without another build, then use an accessible running game for keyboard/touch/reduced-motion review and a short actual capture. Obtain human feedback on enjoyment and aesthetics. Record actual provider usage before comparing cost effectiveness. Keep status pilot until these gates pass; do not automatically launch this follow-up.

## Created roster (this account only)

These identifiers are evidence, not portable setup requirements. New accounts create their own IDs.

| Role | Bot ID reported by Producer |
| --- | --- |
| Producer | 451feb2d-22dc-4fa0-8011-2935d54b7cab |
| Game Design | bc39232a-6421-42b0-8328-59bcbca16879 |
| Blueprints | b7f286d3-1a65-48d5-9866-ed3c9d9d75dd |
| Game Assets | e4875037-021b-4621-83a4-6f297b4c7702 |
| Iteration | 0b56571d-7dd4-4137-9f28-5b5ab42ff682 |
| Economic Design | c53f9da7-193e-423c-bbe5-0a3004b781f1 |
| Game Genres | 76832261-fcc8-4c69-95fe-d90bd95e6290 |
| Capture & Sizzle | e8a5dd45-e061-424c-92dc-4be0f06b6c5f |
| QA & Accessibility | 88fe5037-c8c7-4be0-8b16-6eac5c4bb0f8 |

Core channel: 620a7491-8499-409d-9d61-6b8a065563e1. Support channel: 979f6663-2d47-4fbf-a96a-55ef35e21632. These are local account/channel identifiers, not share links.
