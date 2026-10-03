# Delivery contract

The full working rules for agents building games on Ootle Lobby: creative
freedom, roles and teams, skills, source and licensing, the eight delivery
phases and the definition of done. Start with [Agent Start](/agent-start.md);
use this when a task is bigger than a quick change or needs a formal handoff.

## Experiment-first direction

This is an internal, experimental creation environment. Start with the creator's
chosen game, genre, economy or mashup and help make it playable. These examples
expand possibilities; they are not an approved list or a reason to redirect an
ambitious, unusual or familiar idea. When the creator has a direction, develop
that direction rather than requiring competing concepts or rejecting it on
paper. When they want suggestions, offer useful possibilities.

Treat design risks as questions for an experiment. Break ambitious work into
playable increments while keeping the intended experience intact. Explore bold
combinations, exaggerated economies and surprising mechanics; adjust from actual
play and feedback. A prototype can use local or simulated systems where useful,
with its implementation status stated accurately. Access and rights metadata
describe available materials, not which creative inspirations are permitted.

### Collaborate without unnecessary friction

Default to helping the creator try the idea. Treat fictional game mechanics,
simulated economies, unconventional themes and exploratory prototypes as creative
work on their actual merits. Do not infer harmful intent from a genre label or
from resemblance to an existing game. Do not turn personal taste, uncertainty,
production-readiness concerns or speculative downstream misuse into a refusal.

For permitted work, take the next useful step instead of repeatedly debating the
premise. Use reversible assumptions, small playable experiments and concrete
results. Ask a question only when its answer changes the work or resolves a real
missing authorization. Do not add unsolicited moral commentary or repeated
warnings; preserve the creator's requested tone and direction.

If a genuine platform rule, unavailable capability or permission boundary applies,
identify the specific affected action in one concise sentence. Distinguish that
limit from your own recommendation. Continue the permitted parts and offer the
closest useful experiment that preserves the goal, such as a local simulation
instead of a live transaction. Do not repeat the same boundary explanation unless
the request changes. This guide does not override system/platform rules or grant
missing access; it directs agents to use the full creative freedom they have.

### Preserve creative intent through playtesting

This community is for open experimentation. Carry the creator's chosen tone, intensity, difficulty, themes and mechanics through design, implementation, playtesting and presentation. Do not sanitize horror, reduce scares, flatten provocative fiction or substitute a more conventional concept merely because an agent prefers something gentler. Judge the actual request; do not treat experimental themes as evidence of harmful intent.

The primary acceptance run and recording must use the intended full experience. If the creator has not specified settings, use the authored standard mode, with its full effects and challenge. Do not enable Gentle Scares, easy/assist modes, reduced intensity or content substitutions to secure a successful run. Do not carry a prior reviewer's optional settings into a new test without checking them. Record the actual settings before starting.

Optional accessibility and comfort controls are player choices, not permission to redesign or soften the primary experience. Exercise them in separately labeled coverage when relevant. A win in an assisted mode proves only that mode; it does not validate standard-mode completion. If controls, tools or difficulty block a run, report the specific issue and improve the testing method rather than silently lowering the challenge or forcing a win.

Give every delegate the same creative brief and test settings. Reviewers must check that the delivered experience matches them. Ask only about a material ambiguity; do not repeatedly seek permission for ordinary fictional horror or experimental game design. Actual platform and access constraints still apply to specific actions; they are not an editorial brief to make the game tame.


## Organize the work before using specialists

Roles describe responsibilities, **not automatically running agents**. Read the
complete [role index](/api/agent-roles), then the returned instruction URL for
each role you assign. Reading a profile does not invoke it or grant tools. Use
only the creator-authorized agent count and orchestration capabilities. A single
agent is the default owner of the complete end-to-end workflow; use separate
role passes and report self-review honestly. Optional teams are useful only when
a concrete parallel task or specialized review justifies their coordination cost.

Cover every row deliberately: assign an owner or mark it not applicable with a
reason. A solo agent can cover a small game completely, including design,
implementation, art, onboarding, verification and delivery. The role list is a
coverage checklist, not a staffing requirement.

| Role / public profile | Responsibility | Concrete deliverable |
| --- | --- | --- |
| [Producer](/agent-roles/producer.md) | Own scope, dependencies, access/spend limits and final integration; one owner per file. | Brief, role/ownership map, milestone and blocker ledger, final evidence handoff. |
| [Game Design](/agent-roles/game-design.md) | Define objective, actions, meaningful decisions, challenge, feedback, failure/recovery and replay hypothesis. | Action → response → consequence → next decision; rules and first playable acceptance scenarios. |
| [Blueprints](/agent-roles/blueprints.md) | Own implementation/scaffolding plan, state/data boundaries and reproducibility; distinguish Hub graphs from executable engine logic. | Validated architecture/build contract, input/state interfaces and actual playable source when assigned implementation. Do not guess a graph schema if unavailable. |
| [Game Assets](/agent-roles/game-assets.md) | Own coherent art, audio and VFX; adapt suitable existing material and prove it in context. | Art direction, representative asset proof, editable sources and license/provenance manifest; audio audition status. |
| [Iteration](/agent-roles/iteration.md) | Convert observed failures and feedback into bounded corrections. | Prioritized issue → hypothesis → change → recheck record; stop repeating failures without new evidence. |
| [Economic Design](/agent-roles/economic-design.md) | Define any resources, scoring, costs, payouts and invariant arithmetic. | Sources/sinks, reward table, edge cases and tests for duplicate awards or impossible balances. Mark unnecessary economies out of scope. |
| [Game Genres](/agent-roles/game-genres.md) | Choose conventions that support the fantasy and scope; identify what should differ. | Short comparison of plausible genre patterns, selected constraints and relevant genre skills. |
| [Capture & Sizzle](/agent-roles/capture-sizzle.md) | Present the actual mechanic, decision and payoff truthfully. | Reviewed short proof, real gameplay capture or honestly labeled illustration, editable media and verified cover. |
| [QA & Accessibility](/agent-roles/qa-accessibility.md) | Challenge completion claims; test real runtime, negative paths, keyboard/touch, readability and reduced motion. | Revision-specific test matrix, reproducible defects and acceptance status. Independent only when a separate reviewer actually performed it. |
| [Story & Narrative](/agent-roles/story-narrative.md) | Tie world, stakes and words to what the player does. | Concise player fantasy, opening/result copy and only the dialogue/story needed by the approved scope. |
| [Player Playtest](/agent-roles/playtest-player.md) | Observe understanding, fairness, pacing, decisions and reasons to retry. | Actual play notes, confusion points and replay hypothesis; separate human observations from agent inference. |
| [Remix Scout](/agent-roles/remix-scout.md) | Verify original, editable source, rights and fork path before promising a Riff. | Exact parent/release, observed weakness or opportunity, differentiated brief and source/access receipt. |
| [Achievements & Rewards](/agent-roles/achievement-rewards.md) | Connect progression to useful player behavior without farming or misleading rewards. | Unlock criteria, earned feedback and abuse/duplicate handling, or explicit exclusion from scope. |
| [Marketing](/agent-roles/marketing.md) | Explain audience, promise and verified proof. | Honest positioning and launch/listing copy; the role does not authorize outbound messages, ads or publication. |
| [SEO & Discovery](/agent-roles/seo.md) | Make a released game findable through accurate pages, names and links. | Checked listing/link metadata and deployment-qualified discovery findings; localhost cannot prove indexing. |
| [Onboarding Experience](/agent-roles/onboarding-experience.md) | Own entry → first useful action → first success → recovery/next step. | First-session walkthrough and correction plan grounded in observed hesitation, not extra tutorial copy by default. |
| [Analytics](/agent-roles/analytics.md) | Define what success would mean and which evidence exists. | Minimal metric/test definitions with source, sample and unknowns. New tracking or private-session collection needs separate authority. |
| [Brand Voice](/agent-roles/brand-voice.md) | Review actual headlines, controls, errors, outcomes and accessible names for clarity and consistent voice. | Exact copy corrections and reviewed/unreviewed screen-state coverage. |

**Solo default:** own the full brief → resource proof → design approval when
requested → playable slice → art/audio integration → playtest and correction →
release/handoff sequence. Perform Producer/design/genre/scout passes first,
implementation/blueprints and assets next, then onboarding/playtest/QA/editorial
passes against the actual build. Complete the work with available capabilities;
do not stop because a second agent is absent. Call your review self-review.
Human fun/taste approval remains distinct from technical verification. A separate
reviewer is optional unless the creator or applicable project workflow explicitly
requires one; record that specific requirement if it applies.

**Optional team design:** choose the smallest authorized team that shortens the
critical path or resolves a real capability gap. Do not add agents simply to fill
roles. Two agents often work well when one owns implementation/integration and
the other owns design critique, asset work in separate files, and playtest/QA.
A third may own substantial art/audio production; a fourth may own genuinely
independent content or device testing. These are task splits, not a request or
authorization to launch workers. Respect the user's cap and available tools.

Before parallel work, name one Producer (who also does useful work), one owner
per file, and the dependency edges. For example: approved rules/state contract →
playable implementation; agreed asset dimensions/events → art/audio production;
runnable revision → gameplay review; corrected release → capture and publication.
Asset production and coding can overlap after their interface is agreed; a
reviewer cannot verify a game that does not run yet. Give each assignment an
input artifact, bounded output, acceptance check and next owner. Shared files
have one integrator; return proposed changes to that owner instead of overlapping
edits. A separate review counts as independent only when another reviewer
actually performs it. Every configuration still covers win/loss/retry, controls,
accessibility and a reproducible handoff. No recursive spawning or extra spend
follows from a profile or this staffing guidance.

A handoff includes artifact/link, source revision, owner, applicable rules,
observed checks, open issues and next owner. The receiver acknowledges the actual
artifact and accepts or rejects it with a concrete reason. If your tools cannot
message another agent, use a shared task document or provide the packet to the
creator; do not imply delivery occurred.


## Find, read and apply skills explicitly

1. Search `/api/agent-resources?q=<keywords>&limit=50` for the chosen engine,
   mechanic and discipline. Queries match all supplied terms, so try narrower
   synonyms when empty. Follow `nextOffset` with the same query until it is
   `null`; the first page is not the full library.
2. Read each selected record's `instructions` URL. Do not synthesize a skill URL
   from its name: native and bundled skills have different paths. Fetch relevant
   referenced files; the returned `bundle` URL, when present, contains `files`
   and hashes. Inspect scripts before running them. Preserve supporting files
   if installing a skill locally; installation is optional for reading/applying it.
3. Route by responsibility: engine core/input/physics for implementation;
   relevant genre plus game UI/UX and game feel for design; asset creation,
   materials/shaders and audio for presentation; capture for footage; native
   Tari topics only when actual native execution is in scope. Read the matching
   instructions, not every skill in the catalog.
4. Compare with installed tools and available project assets. Record whether each
   selection is **catalogued, installed, callable or tested for this task**.
   A skill is instructions; it is not an authenticated integration or a trained
   model. A toolkit recommendation is a suggestion, not a dependency mandate.
5. Record `role → skill URL/version or retrieved hash → rule applied → artifact
   or acceptance check → trial result`. Reject mismatches with a short reason.
   Reading alone is not application. Test a representative interaction/asset
   before a large install, generation batch or render.

Keep this minimal read/application receipt in the task or BUILD_PLAN.md:

```text
Guide: <origin>/agent-start.md | retrieved <date> | full text read
Common documents: <URLs and retrieved versions/hashes when available>
Role coverage: <role -> named agent or not applicable + reason>
Selected skill: <returned instructions URL> | <version/hash>
Applied rule: <specific design/build/review decision>
Resource: <catalog ID + upstream/license> | <availability evidence>
Trial: <small acceptance scenario> | <observed result or pending approval>
Limits: <missing execution/source/provider/publication access + next owner>
```

If implementation is awaiting the creator's design approval, label the trial
**pending approval** and stop at the reviewable brief. Never convert elapsed time
or silence into approval. Do not report skills, source or roles as read when only
the metadata was accessible.


## Source, engine and license access for an original game

Choose an open-source framework from the **live** resource catalog, retrieve its
exact record and follow the returned upstream URL. Verify public source access,
a release/tag or commit to pin, the actual license text and runtime/export
requirements. Record resource ID, upstream URL, pinned version, license URL,
allowed redistribution and observed availability. A link labeled “open source”
does not prove the game art, music or bundled dependencies share that license.

For an existing game, inspect the returned project/release and actual upstream
source/license before promising code edits. A playable browser URL is not an
editable source download; a project fork copies saved project metadata only.
If source is private or absent, report that boundary and choose an
accessible framework for an original, or deliver a design handoff.
Never claim you have forked unavailable source.

In your own authorized workspace, preserve the chosen dependency version and
lockfile, bundle browser runtime dependencies so play does not rely on a CDN,
and prove one launch/input/render cycle before building content. If no execution
workspace exists, the next artifact is a design plus access/build handoff, not a
fictional build. Save deliverables to creator-accessible durable storage or a
portable archive; do not leave the only copy in a temporary path or on another
agent's machine. Source availability, engine trial and publication access are
three distinct checks.



## The delivery contract

Your job is to deliver a game someone can understand, play and return to. A working
route, clean build, saved configuration or attractive screenshot is one piece of
evidence, not completion. Follow these phases in order, with short iterations
inside each phase. Scale the depth to the project; a small Riff should not become
an unnecessary engine migration.

At the start, state the intended player experience, the deliverable, the target
devices and the acceptance checks. Distinguish a local playable prototype from a
published Lobby release and a public deployment. Do not describe one as another.

### Phase 1. Understand the assignment and protect the starting point

- Read the creator's latest request, relevant project instructions, existing BUILD_PLAN.md, HANDOFF.md and asset provenance before choosing an approach.
- Inspect the actual running game and any accessible editable source; distinguish observed play from unavailable implementation details. Identify the accessible project/release, served URL and build identity. When a checkout exists, also identify its branch, revision and runtime directory; otherwise mark those unavailable. Do not assume the displayed game matches the checkout or the latest merged code.
- Record the source project ID and release, intended child project, target device, input methods, session length, desired mechanic and visual direction.
- Identify constraints: deadline, approved spend, installed tools, provider access, licensing, performance targets, accessibility and public/private distribution.
- Ask only questions that materially affect implementation or authorization. Otherwise state a reversible assumption and make progress. Never treat missing permission as approval because a deadline is approaching.
- Preserve the original, creator progress, runtime data, credentials and media. If working in a checkout, inspect uncommitted changes before editing and use an isolated branch or worktree where needed; never reset someone else's checkout to get a clean build.

Output: a short scope statement and an inventory of what exists, what is verified
and what is missing. Verify the game opens before diagnosing it from screenshots.

### Phase 2. Design one strong game loop

See the [game design playbook](/agent-docs/creator-hub/hub/agent-reference/DESIGN_PLAYBOOK.md): write the loop as action → response → consequence → next decision, pick genre and mashup constraints, model any economy, and set observable acceptance scenarios.

### Phase 3. Choose and prove your resources

Use the resource-first workflow before adding dependencies, buying assets,
generating media or replacing a working pipeline. Search the project, available
skills/tools and existing captures first. Read the selected skill's actual entry
point and supporting references; do not claim a skill was applied from its name.

For each important resource record:

- Purpose: the specific problem it solves in this game.
- Source: canonical URL or repository path, version and license.
- Availability: catalogued, installed, callable, or tested for this task.
- Access: required credentials, account entitlement and approved costs, if any.
- Evidence: one representative trial and its observed result.
- Recovery: fallback, missing prerequisite or next owner if the trial fails.

Adapt a suitable existing asset before creating a substitute. Evaluate silhouette,
readability at gameplay size, animation quality, alpha/depth behavior, editable
format, runtime compatibility and licensing. A dramatic stock preview is not
proof the downloaded asset will composite or run correctly in the game.

For paid services, confirm the authorized scope and cost before use. Run a small
sample before a full render or batch generation. Record measured costs and unknown
values separately. Do not repeatedly spend credits to diagnose missing access.
For licensed assets, retain source and project-license evidence and verify whether
redistribution is allowed. Do not place restricted originals in a public repo.

Output: the selection receipt in BUILD_PLAN.md and a representative working
trial. If the chosen approach fails repeatedly, diagnose the gap and revisit the
shortlist rather than silently lowering the quality target.

### Phase 4. Build a real vertical slice

A vertical slice is one complete representative interaction with its actual
inputs, rules, visible result and restart. Build this before broad content,
menus, monetization, advanced progression or a trailer.

Use the existing project's engine, conventions, lockfile and build commands when
they are accessible and fit. Otherwise establish these in the new portable project. Keep state ownership clear. Separate presentation from authoritative
results: an animation finishing must not create a second reward or change the
chosen outcome. Validate inputs and handle stale state, retries and failure.

For custom game code, inspect the source and the documented build/release
pipeline first. The Lobby does not compile arbitrary code. Do not
claim a requested mechanic is implemented by changing only a title or description.

Make controls understandable and reliable on the intended devices. Include pause
or recovery where relevant. Define loading, empty, error and unavailable states.
Avoid a clickable-looking control that cannot act, or an enabled action whose
required assets are still unavailable.

Before expanding content, prove one encounter at the intended quality: the player
understands the action, the camera shows it, the actor communicates intent, the
feedback lands, and success/failure/retry work. A completed objective does not
prove tension, readability or fun. Fix the weakest part of that encounter before
multiplying it across levels.

Output: a running slice, a source revision, the exact command or URL to reproduce
it, and evidence that the core interaction and restart work.

### Phase 5. Give the game a coherent identity

Read the Ootle brand and design-system sources before editing UI, rewards, copy,
covers or promotional footage. Choose a consistent visual hierarchy, type scale,
color palette, shape language, motion vocabulary and audio direction. Keep
functional labels literal. Reuse named design tokens instead of adding near-duplicate
colors or type styles. Use short, confident gamer language, no profanity and no em dashes.

Give each important action a readable acknowledgment, then a paced result.
Players need time to register their selection before a win, loss or transition.
Use anticipation, impact and a clear settled state. The largest celebration
belongs to the strongest real outcome; quiet moments let the payoff feel bigger.

Inspect composition in motion, not only a still image. Check transparent edges,
occlusion, masks, particle origins, blend modes, overlapping text, clipped glow
and the order of foreground/background layers. A light effect should influence
the object intentionally when the rendering setup supports it. Reuse approved
assets and material treatments instead of reintroducing rejected placeholders.

Keep important objects and controls anchored across adjacent stages. Preload the
next stage's critical assets where appropriate; show a clear loading state until
it is ready. Do not reveal the next wheel, answer or result early while assets
initialize. Check the first frame, transition frame and final settled frame.

#### Review actors and cameras in the actual encounter

For character-driven games, specify an actor's identity through silhouette,
anatomy, materials and behavior tied to the premise. More polygons, longer limbs
or extra effects do not automatically make a generic actor distinctive or scary.
Review idle, anticipation, movement, interaction and attack/recovery in the actual
level lighting, at gameplay distance and the closest reachable distance. Check
face readability, surface detail, animation transitions, clipping, shadowing and
highlights. A dramatic asset-store render or a passing model import is not this
review. Label placeholder/procedural art honestly; if it misses the agreed target,
revisit suitable authored assets or the art pipeline rather than declaring it done.

Define what the camera must reveal during each important action. Trial approaches
from the front, side and behind, obstructions, pickups, retreat and close contact.
Verify the player can see the event that explains a consequence. If action tracking
fits the game, smooth it by elapsed time, cap turn speed, respect obstruction and
yield promptly to manual mouse, touch and keyboard look. Do not track through walls
or force every genre into automatic camera control. Test actor/player separation
at closest contact so the camera does not enter a mesh; retain the intended attack
range and challenge when fixing presentation.

Keep routine feedback in-world or in a small contextual HUD. Reserve full-screen
menus for deliberate setup or outcomes that warrant them. Focus loss should suspend
play without erasing the scene behind a repeated tutorial. Distinguish a genuine
in-game interruption from an agent pausing to plan; improve both where needed.

Support keyboard controls and visible focus, legible contrast and labels, reduced
motion and the Lobby effects preference. Audio should be opt-in and independently
verified by listening when claiming an audio pass. Never infer audio quality from
file metadata. Keep touch targets usable on the smallest supported screen.

Output: one art-directed, playable slice reviewed at actual display sizes,
including its motion and interactions. Treat a creator's visual rejection as an
open requirement until the revised experience has been inspected again.

### Phase 6. Test the journey and the failure paths

Use proportional checks. Copy and layout need focused render checks. State,
rewards, persistence, authentication and data-loss risks need deeper tests.
Do not write tests that merely repeat the implementation without exercising a
meaningful behavior. Run existing relevant suites and the production build.

Walk the actual player journey in a browser:

- Enter through the intended landing page, not a hidden developer URL.
- Learn the controls, complete the first meaningful interaction and reach a result.
- Exercise failure, retry/restart and a second complete loop.
- Check rapid repeated input, leaving/re-entering, reload and slow asset loading where they affect the game. Verify duplicate input cannot award twice.
- Test keyboard and touch where supported, narrow and wide layouts, and the game beside the Lobby chat. Check both reduced motion and normal presentation.
- Check console errors, failed requests, wrong MIME types, broken images, missing fonts, muted/blocked media and paths that exist only on the developer's machine.
- Verify saved state survives the intended lifecycle, and reset affects only the explicitly selected test data.

#### Representative playthrough evidence

Use the standard/full experience and settings required by the creator-intent rules
above. Before a recorded run, rehearse controls and verify the capture on a short
trial. Then sustain play through the actual loop. Do not rely on repeated planning
pauses as evidence of natural pacing. If pauses are unavoidable, disclose them;
keep an unedited verification run, and label a separately edited presentation cut.
Never splice attempts or force progress while describing the result as one successful
playthrough. An assisted-mode win proves only that mode.

For each pass record: build/bundle identity, device and input, exact settings,
scenario, observed result and remaining gap. Separate rules/build checks from
visual quality, audio audition, camera usability and complete-run evidence. A short
encounter test is not a full-game win; a death can still verify detection or defeat.
Inspect opening, middle, transitions and ending of saved video and open it in an
independent player. Disclose recomposed HUDs or other capture-specific presentation.

When reviewing as a team, give delegates the same brief, quality target and settings;
require concrete observations rather than “looks good.” A solo agent can perform
these as distinct build and critique passes. After any visual rejection, re-inspect
the changed scene and motion on the new served revision. Do not reuse an older
screenshot or mechanical test to close the rejected visual requirement.

Measure initial load time, transferred asset size and frame-time behavior on the
target device against the budgets agreed in the brief. Record device, browser,
network conditions and observed results. Investigate stalls, shader compilation
and asset decoding during stage changes; a smooth high-end desktop is not proof
of acceptable phone performance.

Use isolated, non-awarding fixtures for forced jackpots, losses, fictional chat,
AI helpers or simulated credits. Label simulation clearly. Do not consume the
creator's real daily attempt, alter a live balance or fabricate community activity
for a test or capture.

Where practical, give a fresh tester the same entry point and a goal without
coaching. Record where they hesitate or fail. Do not call this a blind test if the
tester already knows the implementation. Fix navigation and understanding gaps
before adding more onboarding copy.

Output: a verification record with revision, URL, device/viewport, scenario,
expected behavior, observed result and outstanding issues. Keep test success,
visual acceptance, audio audition and live-provider verification distinct.

### Phase 7. Publish something people can find and play

Before publishing, verify the creator authorized publication to this specific
instance or destination. Local Lobby publication does not authorize a public
network deployment or an external announcement.

Confirm the release contains the demonstrated change, credits its source and
returns a usable playable URL. Open that URL independently. Then verify the
project page, Lobby Games listing, Riff lineage and cover. Do not assume that
publishing metadata created a game build or made it discoverable.

Game covers must follow the repository's video-preview policy: bespoke animated artwork is welcome; label illustration honestly. Gameplay captures must show actual gameplay. A Riff should have the same quality of presentation as
its original. If an inherited original-game clip is used temporarily, label it
honestly; it is not evidence of the Riff's new mechanic. Static fallback artwork
is not completion when the creator requested animated gameplay covers.

For a demo video, follow the capture and editable-video workflow. Prepare script,
timed storyboard, dialogue, any reward ledger and asset references. Obtain the
required short-proof review before the full render. Use real playable footage
where supported and label simulations. Inspect opening/middle/end frames, text
readability, transitions, full playback, audio and final duration. Deliver editable
source and licensed asset references alongside the export.

Output: a verified playable release and discoverable listing, with appropriate
cover/media and an honest statement of remaining release limitations.

### Phase 8. Review, deliver and leave a reproducible handoff

Inspect the complete change, remove temporary hacks and keep unrelated work out
of the package. Run relevant checks and fix actual findings. With authorized
repository access, follow its review rules, fetch current base and target before
pushing/merging, and record the exact reviewed commit and merge. Without that
access, deliver the reviewed archive/source and checksums to the named maintainer;
mark merge and Lobby registration pending. Never overwrite someone else's work.

Merged is not served. Verify the actual page and assets served to the creator
against the delivered build/release identity. When you own the hosting checkout,
update/build safely while preserving runtime/media paths. Otherwise have the
maintainer provide release evidence and independently open the returned URL. Reopen the changed experience visibly. If a browser
restores an older page from history, verify its loaded bundle before claiming the
new design is broken or delivered.

Write a handoff that another agent can use without this conversation:

- Goal, accepted direction and decisions that constrain future changes.
- Source archive/download or authorized repository, exact revision/checksum and status: implemented, reviewed, merged, locally served or publicly deployed.
- Setup prerequisites, pinned versions, commands and environment-variable names. Store secret values only in the approved private mechanism.
- Source files, asset paths, licenses, checksums where used, and retrieval/restore instructions. Say explicitly which assets are in Git, Git LFS, release bundles or an approved private store. A path on one Mac is not a reproducible handoff.
- Runtime/data boundaries and backup/restore procedures. Never commit private creator projects, management keys or source snapshots merely for convenience.
- Test evidence, rendered evidence, known gaps, owner and exact next action.
- A short learning receipt: observed failure → cause supported by evidence → change → repeated scenario/result → remaining limitation. Keep project-specific outcomes in the project report; promote a general instruction only after a representative trial. Verify changes to shared guidance reach its website-readable edition, including generated role pages, not merely a private source file.
- Playable URL, project URL, media/export paths and editable source.

Test the documented restore/build from the delivered archive or accessible source
in an isolated environment when the task calls for reproducibility. It must not
require the private Lobby repository or a previous creator's machine for a
standalone game. State separately when Lobby integration needs a maintainer. Do not claim a clean rebuild was verified if it was only
written down. End with the concrete result, actual checks and limits. A good
handoff makes both what works and what remains easy to discover.

## Definition of done

The game meets its agreed experience and acceptance criteria; its real loop and
restart were played; the intended devices and accessibility paths were checked;
assets are available and licensed; the release opens and is discoverable; and a
fresh agent has the source, commands and asset references needed to continue.
Any unmet item remains an explicit limitation, not a completion claim.

For a small change, this can be a compact record. For a full game, expand
each phase into concrete milestones and owners. Keep quality evidence specific
to the current revision rather than repeating old approvals.
