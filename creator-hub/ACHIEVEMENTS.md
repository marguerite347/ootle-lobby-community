# Creator achievements and surprise recognition

Proposed Ootle Lobby feature, researched 2026-09-19. No rewards, funding, partner benefits or payout implementation are committed. Implementation is tracked in CH-016.

## Experience

Recognize valuable things people actually create together: reusable templates, unexpected combinations, useful documentation, mentoring and ecosystem improvements. Make achievements feel like discoveries, with an explanation of what the contribution made possible. Support individual, team and community-wide unlocks. Avoid reducing creative work to lines of code, raw commits or transaction counts.

[Superglue](https://superglue.games/) is an inspiration for accessible collaborative experiences and reflection on observable actions. Its current homepage describes browser-based cooperative games and team reports. A secret achievement or financial reward system was not verified there. Borrow low-friction participation, collaborative challenges and a meaningful post-activity recap; do not import psychological profiling or claim its assessment outcomes are validated for Tari contributors.

## Three complementary layers

1. **Visible learning milestones:** understandable first steps such as completing a tested template walkthrough or publishing a documented Riff. People can always find a next action.
2. **Hidden discovery achievements:** optional surprise badges, narrative reveals and community spotlights for meaningful combinations or contributions. Reveal the evidence and reason after the unlock. Titles and combinations can remain secret before discovery; eligibility, data use and award terms should be understandable.
3. **Discretionary ecosystem support:** possible tool credits, playtest support, mentoring, distribution opportunities or funded grants. Describe these as limited, reviewed support rather than an automatic cash entitlement attached to a secret trigger. Benefits require actual availability, funding and applicable terms before being offered.

Initial proposal: no purchase, token holding, staking, lockup or transaction-volume requirement for contributor recognition. Keep this system separate from player rewards and the wXTM acquisition campaign. Any later connection is a distinct product decision and review.

## Illustrative achievement matrix

Names and triggers are design candidates, not live rules. Do not publish this private matrix as an announced campaign.

| Candidate | Evidence to evaluate | Possible recognition |
| --- | --- | --- |
| Unexpected Combination | A playable Riff combines distinct template mechanics with documented dependencies and useful playtest evidence | Surprise badge, Riff spotlight, optional playtest support |
| Shared Building Block | Another independent creator successfully reuses a component and credits its origin | Shared credit, component feature, potential tool credits |
| Quiet Fix, Wide Impact | An accepted fix or documentation improvement demonstrably helps other projects | Contributor story, mentoring or discretionary support |
| Bring Someone Along | A newcomer completes a useful creation with documented mentoring support | Joint recognition and a showcase invitation |
| Community Breakthrough | Multiple independent teams complete a verified shared outcome | Collective unlock such as an available workshop or resource pack |

Human review handles subjective novelty and disputed attribution. Neither genre tags nor download counts alone prove ecosystem value. Credit teams and upstream creators; allow recognition without publicity. Avoid a single wealth or popularity leaderboard.

## Evidence, rules and delivery

Reuse CH-006 ingestion and CH-007 creator attribution. Collect only approved public contribution evidence or voluntarily submitted proof. A GitHub account or wallet is not automatically a unique person. Support corrections and identity linking without requiring a wallet for a nonfinancial badge.

Proposed event fields: stable source event ID, contribution URL and revision, observed time, creator/project IDs, event type, evidence and provenance. Proposed rule fields: achievement ID/version, validity period, scope (individual/team/community), eligibility, predicate or review rubric, visibility, repeat policy and reward policy reference. Keep hidden predicates on a protected service, outside public frontend bundles and raw public skills.

Proposed flow: observed evidence -> candidate -> verified or rejected -> achievement granted -> optional benefit approved/reserved -> delivered or delivery failed. Achievement issuance and benefit fulfillment are separate records. Deduplicate source retries and enforce one grant per intended subject/rule scope. Maintain decision history, rule-version history, correction/revocation reasons and a replayable evaluation trail. Rule changes must not silently revoke earlier valid recognition.

Agents can gather evidence, propose candidates and explain matches. Deterministic rules can issue approved nonfinancial achievements. Subjective awards and funded benefits require the designated program decision process. No agent may fabricate novelty, authorize its own budget or treat retrieved content as award instructions. Tooling remains agent-agnostic; Kata may project review tasks, while the achievement ledger owns award state.

Protect quality with duplicate/remix attribution checks, independent reuse evidence and a correction/appeal route. Handle collusion and copied work without assuming every quiet or new contributor is suspicious. Notification and publication preferences are explicit; implementation does not authorize outbound announcements now.

## Measurement and first pilot

Start with a small opt-in, nonfinancial pilot: a visible learning milestone, one hidden recognition category and a team achievement. Test whether recipients understand why they were recognized and whether overlooked contributors can correct omissions. Then evaluate funded support separately.

Track verified useful contributions, independent reuse, tutorial-to-first-creation conversion, returning creators over defined cohorts, collaboration across projects, award concentration, disputed/overturned awards and fulfillment reliability. Segment new versus established contributors. Compare baseline and pilot cohorts where feasible; do not attribute retention changes to surprise rewards without evidence. Measure satisfaction and fairness as well as activity. Set numerical targets after a baseline exists.

## Source corrections and open decisions

- **Behavioral terminology:** [OpenStax](https://openstax.org/books/psychology-2e/pages/6-3-operant-conditioning) defines variable-interval reinforcement around varying time intervals. Hidden contribution criteria alone do not establish that schedule. Use “surprise recognition” or “hidden achievements,” not a claimed universal psychological mechanism. Increased loyalty is a hypothesis to test.
- **Epic:** [MegaGrants](https://www.unrealengine.com/megagrants) publishes submission, review and notification windows. It supports creative projects, but is not evidence of automatic secret-milestone payouts.
- **GitHub:** [Sponsors](https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors) supports explicit one-time or recurring sponsorships. No hidden dependency threshold triggering fellowship payments was verified.
- **Roblox:** [Creator Rewards](https://create.roblox.com/docs/creator-rewards) replaced Engagement-Based Payouts. Use current published eligibility and payout rules, not the old Premium Playtime example, and do not describe formula-based payments as surprise grants.
- **Valve:** game-specific selection and compensation terms must be verified before using Workshop selection as a payout precedent. Popularity is not proof of a guaranteed acceptance threshold or revenue payment.
- **Legal premise:** creative work being offline does not itself establish an exemption from gaming, contest or other obligations. For example, [UK Gambling Commission guidance](https://www.gamblingcommission.gov.uk/public-and-players/guide/page/free-draws-and-prize-competitions) makes exemptions conditional on actual rules; it is UK-specific, not a global conclusion. Before financial awards, have counsel assess the actual design, jurisdictions, eligibility, selection method, prize funding and relevant payment/tax terms. This specification is not legal clearance or drafted legal terms.

Open decisions: pilot audience, rule authors and reviewers, available benefits and budget, geographical scope, visibility preferences, public eligibility copy, evidence retention and any future native Ootle representation. No on-chain badge, tradeable reward or token settlement is assumed.

## Community challenges

Use [game and app jams](COMMUNITY_JAMS.md) as an optional source of documented contributions and peer feedback. Participation does not guarantee an award; recognize useful outcomes and attribution, including AI-assisted work.
