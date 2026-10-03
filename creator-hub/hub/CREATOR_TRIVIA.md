> Presentation update: the original easier daily pool and three original playtest questions are active again. The advanced question banks remain saved for a later pass; existing round indices remain valid.

# Creator trivia question bank

Deferred advanced pass, September 25, 2026: replace beginner definitions with short, scenario-based decisions about creating games for Ootle. Difficulty comes from applying concepts, not trivia about names or unpublished claims. We cannot promise the material is unavailable elsewhere online.

## Ownership and delivery

- `server/creatorQuestions.mjs`: 18 daily questions, four plausible choices and one concise explanation. Correct choice is first internally; the server shuffles options and does not expose the correct answer during play.
- `server/dailyTrivia.mjs`: retains the 14 legacy entries at their original indices for persisted rounds. `questionForDay` selects the original 14 easy questions for new rounds; the appended advanced bank is inactive. Do not reorder/delete existing entries without a saved-round migration.
- `client/src/components/creatorPlaytestQuestions.ts`: nine saved, inactive preview scenarios. They are separate from the production answer bank so importing the preview does not bundle production answers. The presentation does not import this file.
- `rewardPlaytest.ts`: cycles the original three easy questions on Test again/reload; existing timing and payout rules remain intact.
- `DailyTrivia.tsx`: shows a readable Creator takeaway after the preview resolves. The ordinary flow retains its settled takeaway disclosure.

## Evidence and scope

Read the local skills and their metadata before revising protocol questions:

- `creator-hub/skills/templates-composability/SKILL.md`, metadata and `examples/counter/src/lib.rs`: independent instances, composition/ABI checks and public-read/protected-write Counter behavior. Counter construction, authorization and rollback have local engine evidence; arbitrary compositions are not claimed tested.
- `creator-hub/skills/resources-state/SKILL.md`: resources, vaults, buckets, identity and amount checks. This guide is source-reviewed, with resource runtime validation still pending.
- `creator-hub/skills/tari-and-ootle/SKILL.md`: authoritative state versus presentation and public-state boundaries.
- Official pinned template overview: https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/guides/template-overview.mdx
- Official pinned resource guide: https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/guides/resources.mdx

Game-design answers are recommendations under the scenario's stated goal: contrast for rare rewards, differentiated feedback, and a focused playable slice for a changed mechanic. Do not frame them as universal protocol rules. Privacy questions concern explicitly public state, not a blanket claim about all Ootle resources.

## Editorial criteria

Keep the question and four options readable within the existing 20-second round. Avoid acronym recall, trick wording, joke distractors, API-version trivia and correct answers that are always visibly longest. Each item should teach a concrete decision with one best answer under its stated assumptions. Explain why after settlement. New factual claims need a source and its validation boundary. Add new topics without silently changing old persisted answer meaning.

Validation: production frontend build; dailyTrivia server tests (14) and client tests (147), including answer redaction, repeat settlement, timing and restart behavior. These checks validate behavior, not learner difficulty; the latter needs playtest feedback.
