# Community design research: turn references into tested improvements

Reviewed 2026-09-23. User-supplied discovery sources:
- [AI-built website discussion](https://www.reddit.com/r/vibecoding/comments/1u3gkha/what_websites_have_you_built_with_ai/)
- [r/vibecoding](https://www.reddit.com/r/vibecoding/)

## Evidence boundaries

Read the accessible discussion and community feed, then inspected the public text of Noodlerack and Puzzle Lair. This is a bounded research pass, not an exhaustive subreddit review or an interactive playtest. Fanous returned no readable page content; its description below is creator-reported. Search-index relative timestamps are not dependable publication dates. No engagement, retention, revenue, build-time or quality claims are independently validated. No third-party instructions, code or assets were installed.

## Useful references

The discussion includes a creator describing a reusable library of assets, references and motion presets; another emphasizes preparing content before layout. Feedback also flags long loading, a game with browser requirements, and predictable quiz answers. These are anecdotes and leads for testing, not universal results. Fanous's creator describes learning progress as stars lighting a constellation. [Discussion](https://www.reddit.com/r/vibecoding/comments/1u3gkha/what_websites_have_you_built_with_ai/)

| Reference | Public evidence inspected | Lobby application to test |
| --- | --- | --- |
| [Noodlerack](https://noodlerack.com/) | Page exposes patch presets, dice, undo, stepwise tutorials, a help action and a community patch board. Its manual describes keyboard controls, recovery and remixing. Functionality not playtested here. | Studio: start with a working blueprint, change one node, preview the consequence, undo, then share a fork. Offer guided help at the current step. |
| [Puzzle Lair](https://puzzlelair.com/) | Page presents today's featured puzzle, short rules, difficulty choices and an account-free trial before progress/account benefits. No retention evidence collected. | Daily Spark: make today's action immediately clear, teach after answering, and provide a useful next activity after the daily round. |
| [Fanous](https://fanous.io/) | Creator-reported constellation progression; direct extraction empty. Visual and interaction quality unverified. | Explore a Learn skill path linked to playable examples and actual completed steps; avoid decorative progress with no learning evidence. |

## Proposed acceptance changes for our team

These are our hypotheses based on the user's feedback and this research, not claims that the reference sites prove them.

1. **A recognizable creative direction.** Design and Assets name the focal object, material language and motion rhythm. Show how they express Ootle Lobby beyond changing labels and accent colors. Preserve the approved brand; references are inspiration, not templates to copy wholesale.
2. **One complete interaction before more polish.** For the current wheel, deliver ready → spin → ordinary result and 5× → bonus offer → final settlement in an isolated fixture. The wheel is the primary visual, with legible pointer, boundaries and outcome. Each state has one obvious next action. Keep the real probability table truthful and inspect reduced motion. Do not consume the user's daily attempt.
3. **Show motion, not just stills.** A short real capture must demonstrate acceleration, slowing, landing, result persistence and reward transfer. QA checks correctness; Design/Player Experience separately assess readability and pacing. Audio remains unverified until heard. Human enjoyment remains a human acceptance check.
4. **Inspect the whole viewport.** Brand Voice and QA review integrated desktop and narrow mobile pages, not isolated components. Check for duplicate slogans, overflow, missing covers, missing projects, overlays and competing CTAs. A source review cannot pass this gate.
5. **Recover gracefully.** Expose loading/error/retry states and supported-device requirements before a dead end. Test reloads, interruption and repeat submissions. Claims about backend settlement require actual tests, independently of the animation.
6. **Measure one improvement.** Analytics and Player Experience select one question per iteration: time to first meaningful action, successful completion, confusion about the next action, or willingness to replay. Record unknown baselines honestly; don't substitute Reddit votes for usage evidence.

## Reuse and delivery receipt

Reuse the existing resource-first workflow, game-feel/game-ui skills, gacha reward skill, BRAND.md and BRAND_REVIEW.md. The gap is application and rendered acceptance, not a missing agent persona or another framework. No new workers, dependencies, asset generation or redesign hold is introduced. Producer owns a single bounded review packet and uses the existing implementation worker. Apply relevant findings without restarting ongoing work; defer Studio/Learn experiments to their own scoped task.

Each adopted reference should record: URL/date, observed behavior, evidence level, chosen adaptation, owner, smallest trial, result and remaining gap. A catalogued reference is not an installed package or a verified workflow. Link the exact playable revision and capture in the delivery handoff. This document alone changes no product behavior and establishes no recurring collection service.
