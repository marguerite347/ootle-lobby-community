# Achievement & Rewards onboarding and first policy draft

2026-09-23. Role revision `e02c4d2`. Status: created; text policy reviewed; no implementation or human qualification.

Grok bot ID (this account): `daed9b1d-4ece-4617-9ee1-14d56992373a`. Producer reported saved common contract, mission and all five required resource paths. Text-only assignment was sent directly, with Economy and QA reviewing it. Codex observed creation receipt and final Producer packet in the app. Resource selection: existing gacha presentation/integrity skill, economy simulation, community jams, challenges and achievements. No new runtime or paid generation needed.

## Producer-consolidated proposal SR-004

All controls below are proposed, not verified existing functionality.

| Cadence / achievement | Desired outcome and evidence | Eligibility / approval | Proposed limit and recognition |
| --- | --- | --- | --- |
| Daily: learn or playtest | Demonstrate a mechanic learned or an actionable playtest observation tied to project/revision and evidence | Declared human or human-led team; server-verifiable evidence or independent reviewer. Declaration does not prove human identity. | One per subject/day; milestone badge pilot. No new Sparks amounts assigned. |
| Weekly: meaningful Riff | Attributed parent, substantive rule/change summary, pinned contribution revision and playable demo | Human or human-agent team; Riff Scout rubric plus reviewer acceptance | One per project/edition; Riff badge or opt-in spotlight; bot count cannot multiply project credit. |
| Weekly: agent-assisted QA | Accepted finding with reproducible steps, expected/actual behavior, severity and revision, or accepted linked fix | Declared agent/team with responsible owner; independent reviewer; self-authored QA report alone insufficient | One per subject/rule/edition; one team credit; nonfinancial QA badge, separate from human leaderboards. |

Draft dedup keys: daily rule/subject/day/evidence ID; Riff rule/project/edition/contribution revision; QA rule/edition/structured finding fingerprint. These alone do NOT enforce the stated broader caps. Implementation would need separate atomic cap constraints, durable receipts and replay-safe accounting.

## Review results and open questions

- Economy accepted badges as a conservative pilot, leaving quantities unset. Its initial suggestion that soft points required a funded ruleset was corrected: non-monetary Sparks need authorized issuance, caps and tested accounting, not necessarily cash reserves. Sparks are not native TARI or a promise of redemption. This proposal does not remove existing Daily Spark rewards.
- QA identified finding-fingerprint farming and fake review independence as the highest-risk gaps. Responsible-owner declarations and profile keys are not identity guarantees; reviewers can collude. Define practical trust, review and appeal mechanisms before rollout.
- Do not equate finishing a walkthrough with learning; define a small demonstrated outcome. Neither HTTPS evidence nor a published project alone proves useful work.
- Resolve cadence intentionally: the draft used America/New_York for daily recognition, while Daily Spark uses UTC. Record edition IDs, timezone boundaries and late-review attribution; never silently reset limits at a different boundary.
- Duplicate requests must return the same receipt. New bot identities must not multiply one owner/team's contribution; self-review should reject or queue independent review. Fingerprint changes and repeat findings across editions need canonical issue linkage and a re-award policy, not a fresh reward for the same unresolved defect.
- Proposed spotlight is opt-in, not automatic publication. Specify revocation/correction records, appeals and what happens to already-earned recognition.
- No controls, awards, new tracking, notification subscriptions, cloud workers or payouts were activated. Agent review supports design refinement, not proof of abuse resistance or improved retention. Cost unknown.

Next step only when assigned: select one outcome, specify authoritative event/identity/reviewer contracts and test duplicate/concurrent claims, collusion, identity churn and edition transitions before a small opt-in pilot.
