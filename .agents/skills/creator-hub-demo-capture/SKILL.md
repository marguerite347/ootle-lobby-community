---
name: creator-hub-demo-capture
description: Record a Ootle Lobby end-to-end browser walkthrough across its main routes, with route screenshots, editable Remotion trailers and verified playback. Use for demo recordings, cinematic sizzle reels, product walkthroughs and visual handoffs of a running Ootle Lobby.
---

# Ootle Lobby demo capture

Deliver a playable walkthrough recording, clear screenshots of the main routes, and a short index connecting each artifact to the observed product state. A request for screenshots only does not require video. Capture the real running app, including empty states or blockers.

## Establish the target

- Use the user's URL and browser when supplied. Otherwise inspect the available Ootle Lobby instance; `http://127.0.0.1:4180` is a historical starting point, not a guaranteed current server.
- Confirm the visible app and current navigation before planning shots. For a local build, identify the serving checkout/process and revision when accessible. A branch displayed in an editor or a PR tab does not establish which build the browser serves. If uncertain, label the build unverified.
- If asked to include particular commits, verify them in the serving checkout and confirm the served build reflects them. Do not infer inclusion from an agent's completion message or merge status.
- Discover the browser and recording capabilities actually available; read their usage instructions before operating them. Prefer app-window or browser-only capture. Fix a consistent viewport and keep unrelated apps and private content outside the captured area.
- Save into a fresh local capture directory outside tracked source by default. Do not start unrelated maintenance, change observation settings, publish, or send the results to others as part of capture.

## Plan and traverse the routes

Use the following historical coverage as a checklist, adapting names and order to the current UI. Follow visible navigation and inspect actual hrefs instead of inventing route paths. Read [recorded-workflow.md](references/recorded-workflow.md) when reproducing the September 19 walkthrough or resolving historical context.

| Stop | Useful visible evidence |
| --- | --- |
| Home / landing | Product identity, main calls to action, catalog overview |
| Ootle-testnet collection | Collection purpose and representative resources, including Rust/WASM starters if present |
| Onboarding | Entry point, explanatory steps, and next action |
| Studio | Project list or actual empty state |
| Sources | Indexed-source names, status, and freshness indicators |
| Build | Available starter or creation choices and a representative detail |
| Explore | Catalog browsing, a relevant filter/search, and a resource detail |

If navigation has changed to Discover, Learn, Create, Projects or another structure, cover every current main route and map the historical concepts to observed destinations. Mark removed or inaccessible concepts explicitly; do not force obsolete routes or omit new main routes.

For each stop:

1. Navigate through the UI so the recording communicates how to reach it.
2. Wait for meaningful content and media to load. Allow a readable pause before the next action.
3. Capture a clean overview screenshot; add a detail shot only when it demonstrates a meaningful interaction or state.
4. Record the actual URL, observed result, screenshot filename, and recording timestamp in the index.

Use a representative resource to connect discovery, detail, and build/onboarding where those links exist. Inspect before clicking actions that create persistent projects, publish, connect wallets, or submit transactions. Demonstrating a route does not by itself authorize those actions; use already-authorized demo data or stop at the action boundary. Preserve empty states rather than fabricating project activity.

## Record and verify

- Start the recorder before the first route, confirm it is active, then perform the walkthrough. Use browser automation video or an available window recorder with an explicit output path. Keep tool-specific commands in the execution session rather than assuming a recorder is installed.
- End and finalize the recording with the selected tool's documented stop/close operation. Verify the saved file exists, is nonempty, has plausible duration, and plays. Inspect opening, middle, and closing frames, plus any route where loading or media looked suspect.
- Open the screenshots to check readability, correct routes, loaded content, and absence of overlays or unrelated private material. A successful HTTP response or page title is insufficient visual verification.
- If recording is unavailable, save the screenshots and route index and clearly report the missing video. Do not label a screenshot sequence or historical event log a completed screen recording.
- If a route fails, capture the failure and note it. A short local retry is reasonable; ongoing app repair, deployment, or merging is a separate task unless already requested. Do not silently switch builds to make the capture appear complete.

## Handoff

Provide absolute local links to the video, screenshots, and a compact Markdown index. Include capture date, base URL, viewport, known serving revision (or unverified), route-to-artifact mapping, demonstrated interactions, and any blockers or skipped steps. Describe coverage precisely: a complete route tour does not prove successful project creation or deployment.

Use stable sequence-based filenames such as `01-home.png`, `02-ootle-collection.png`, `walkthrough.webm`, and `capture-index.md`, adapting the extension to the recorder's actual output. Keep raw Computer History streams and private source snapshots out of the repository and deliverables.

## Cinematic trailer or social reel

Before full production, follow [production-review.md](references/production-review.md) to save a script, storyboard and representative proof for creator approval. Do not substitute technical checks for creative approval.

For an edited trailer, read [trailer-workflow.md](references/trailer-workflow.md). Reuse the existing `creator-hub/video-templates` Remotion workflow before inventing a separate renderer. Preserve editable scenes, narration, audio stems and timing alongside the exported video. The raw walkthrough remains the factual source; a trailer is a selective edit, not proof that every demonstrated integration is deployed.

## Learn from the result

After a demonstrated failure, record the symptom, evidence, correction, verification and remaining limitation in the task handoff. Update this skill only with reusable lessons supported by that evidence. Keep one canonical repository copy and synchronize the installed copy when requested. A skill file guides future runs; it does not retrain the model or prove every future run follows it.

## Creator intent and representative playtests

Preserve the creator’s requested tone, intensity, difficulty and experimental premise. The primary playtest and recording use the authored standard/full experience unless the creator requests different settings. Check and record settings before starting; do not inherit a prior tester’s Gentle Scares or assist choices. Never lower intensity, enable assistance or force a win merely to obtain completion footage. Optional accessibility/comfort coverage is separate and clearly labeled; it cannot substitute for acceptance of the intended experience. Pass these requirements to delegates and check their evidence. If a tool or gameplay issue blocks completion, report that issue rather than silently softening the game. See the site-readable Agent Start section “Preserve creative intent through playtesting.”
