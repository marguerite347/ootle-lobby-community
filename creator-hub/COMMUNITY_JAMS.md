# Tari creator jams and community challenges

Program design, updated 2026-09-22. Local challenge pilot is implemented; see [runtime and reward handoff](hub/CHALLENGES.md). AI-friendly game and app tracks for Ootle Lobby. This is an event-program design, not a published schedule or committed prize program. Dates remain unset until a kickoff is selected. GitHub issues track implementation; the [execution tracker](https://docs.google.com/spreadsheets/d/1wqRmccK3LWsamIe3yiXjkYCBxmOAoQtyoObgCOzhHF8/edit) remains the marketing calendar.

## Reference and adaptation

[Portfolio Builders Jam Week #92](https://itch.io/jam/portfolio-builders-jam-week-92) is a weekly portfolio-building event allowing new work or improvements to existing projects, with explicit weekly goals and reflection. Its theme is currently TBA and it prohibits generative AI. Its [series hub](https://orlandoo.itch.io/portfolio-builders-jams) links team finding, theme announcements, previous jams and reflection discussions. Checked 2026-09-19.

Borrow the repeatable structure. The prompts below are original Tari proposals, not copied historical jam themes. Our events expressly welcome AI-generated code, art, audio and assisted research, subject to participants having rights to submit their work. We are independent of the referenced organizer; do not imply partnership or submit AI-made entries to their no-AI event.

## Participation and creator journey

Discover a challenge → choose game or app track → pick a small deliverable and starter → build with people and/or agents → get feedback → submit a demo → showcase, Riff and improve.

- Welcome beginners, solo creators, teams and agent-assisted workflows. An existing project is eligible when the weekly contribution is described.
- Every prompt has a small entry-level outcome and an optional native Ootle integration. A wallet or token purchase is not required to learn, prototype or submit an off-chain demo.
- For Tari integration, link the selected template, source revision, network and actual evidence. Label concept, local executable and testnet-verified separately. Do not imply our proposed shop, achievement or crafting templates already exist.
- Ask for a demo or recording, a short description of what changed, credits/licenses, tools and AI assistance used, and an optional source link. Source publication is encouraged, not assumed. Template submissions need explicit reuse permissions.
- Keep judging focused on usability, creativity, learning, useful composition and documentation. AI use is welcome, not an advantage or penalty by itself. Avoid raw token-volume, commit-count or popularity ranking as a quality proxy.
- Offer opt-in spotlights and peer feedback. Cash prizes, grants and token rewards are not promised. Connect recognition to the existing [achievement design](ACHIEVEMENTS.md).

## Recurring calendar structure

Each challenge is a seven-day edition; the following review/showcase can overlap the next edition. Show timezone and exact deadlines once scheduled. Use America/New_York if following the marketing team's local time, allowing daylight-saving transitions.

| Window | Event or task | Concrete output |
| --- | --- | --- |
| Week before kickoff | Prepare prompt, starter links and submission page | Tested starter path, accessible brief, explicit scope and success criteria |
| Monday | Publish challenge and optional kickoff | Participant chooses one finishable goal; game/app tracks share the theme |
| Tuesday | Optional beginner clinic and team finding | Setup help, collaborators, questions captured as educational material |
| Wednesday | Work-in-progress share / playtest | Screenshot, build or short clip; one actionable feedback request |
| Thursday–Saturday | Build and feedback window | Protected production time; optional async help |
| Sunday | Submission deadline | Demo, weekly change summary, credits and self-reported learning |
| Following Monday | Showcase and reflection | Curated projects, lessons, reusable components and next-step links |

Schedule these as distinct events, linked to one edition ID. Do not fill the calendar with daily mandatory meetings. Offer asynchronous participation across timezones. Public copy must respect unreleased game/campaign announcements.

## Twelve-week prompt bank

Relative weeks start at the chosen kickoff, not at Week 1 of the existing launch plan. Themes can be reordered; no launch date is implied.

| Edition | Theme | Game track | App track | Small completion goal / optional Tari extension |
| --- | --- | --- | --- | --- |
| 1 | One action, one result | One-button toy or clicker | One-action useful utility | Working input/output loop; optionally read a native Counter |
| 2 | Make it yours | Reskin or Riff a starter | Personalize a starter interface | Before/after demo with attribution; explain selected template |
| 3 | Collect and organize | Inventory or collection prototype | Resource library or collection organizer | Add, inspect and filter three items; explore resource identities |
| 4 | Tradeoffs | Small shop or upgrade choice | Budget or resource-allocation tool | Show a meaningful choice and rejected unaffordable action; local economy simulation |
| 5 | Build from parts | Crafting or combination puzzle | Reusable workflow with two modules | Demonstrate compatible parts and one invalid combination; native composition is a stretch |
| 6 | Privacy by design | Hidden-information prototype | Consent or private-data workflow | Disclosure map and tested visibility boundaries; no automatic privacy claims |
| 7 | Together | Cooperative goal | Community progress tracker | Two participants contribute to a shared outcome; optional milestone component |
| 8 | Access for everyone | Keyboard-friendly game loop | Accessible onboarding or navigation | Complete core flow by keyboard; explain any wallet step |
| 9 | A useful surprise | Achievement or discovery mechanic | Helpful contextual recommendation | Explain the trigger and show it once; prevent duplicate unlocks |
| 10 | Let the community shape it | Balance experiment with player feedback | Proposal or feedback tool | Compare two versions using feedback; optional governance exploration |
| 11 | Show how it works | Playable tutorial and capture clip | Interactive walkthrough or help flow | Newcomer completes a task; publish a captioned demo with permission |
| 12 | Ship, reflect, Riff | Polish a playable vertical slice | Polish a usable app workflow | Working demo, known limits, change log and Riff instructions |

Starter resources: [Ootle documentation](https://ootle.tari.com/), [community apps](resources/ootle-apps.md), [engine resources](resources/game-engines.md), [game design](resources/game-design.md), [audio](resources/audio.md), [AI workflows](resources/ai-engine-workflows.md), [TariSkills design and implementation work](TARISKILLS.md), [Capture & Promote](VIDEO_WORKFLOWS.md). Match the actual starter/tool versions; external engines are not automatically native integrations.

## Ootle Lobby placement and event model

Add Community → Challenges with Upcoming / Open / Showcase / Archive views and game/app filters. Link relevant challenges from Learn, template/resource detail pages, and the project creation flow. A submission becomes a discoverable project card with creator credits and source/template relationships, not a duplicate resource record. Repeated entries link to project versions and explain new work.

Persist a series ID and stable edition ID, original prompt, game/app variants, lifecycle, timezone, nullable start/end timestamps, milestone event IDs, starter resource IDs, skill IDs, submission requirements and canonical URL. Store submissions separately with project/version IDs, demo URL, credits/license, AI disclosure and evidence level. A draft with unknown dates stays out of public upcoming calendars and ICS feeds. Date edits update the same event UID instead of making duplicates; cancellations remain identifiable.

The future event store is canonical for published challenge dates. Calendar exports and marketing references are projections using edition IDs. Keep these proposed relative-week prompts in Git until scheduling exists; do not silently create a competing editable spreadsheet. Imports from external jam sources remain inspiration candidates requiring editorial selection, attribution and terms review, never automatic Tari events.

## Measurement and feedback

Weekly edition report: challenge views, voluntary joins, first-time/returning participants, valid submissions, playable/usable demos, completed feedback exchanges, documented Riffs and verified native integrations. Define completion as accepted submission with required evidence; report withdrawn/rejected entries separately. Compute submission rate as submitters / joined participants, and four-week return rate from participants who had a full four-week follow-up window. Show numerator, denominator and coverage.

Attach challenge ID and project ID to consented aggregate funnel events (view, join, starter opened, submission, demo opened, Riff). Keep anonymous visitors distinct from people and teams; count agent-assisted projects by project, not number of agent runs. No wallet identities are needed for attendance analytics. Tie outcomes to builder activation and useful template reuse, not promised financial returns. Report missing data as unavailable, not zero; reuse the existing dashboard freshness work.

## Marketing-calendar handoff

Add a proposed preparation item to the next available planning week: select kickoff, confirm community support capacity, pick the first two themes and check starter readiness. Then create the recurring kickoff, feedback, submission and showcase events above with explicit dates and links. Create promotional briefs before each kickoff and reserve a post-submission clip/recap window. Integrate with the planned agent challenge only after its scope and date are chosen; no Hermes or other partnership is confirmed here.

This commit does not edit Google Sheets, send invitations or publish events. Implementation and calendar handoff are tracked in [implementation issue #80](https://github.com/marguerite347/tari-growth/issues/80).
