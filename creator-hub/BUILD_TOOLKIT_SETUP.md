# Idea rolls and project setup

Create → Build toolkit → **Roll an idea** proposes a small playable project, four component roles, matching catalog skills and a first-playable acceptance test. A selected foundation is preserved. Re-roll changes the theme or bounded mechanic; a manually entered engine stays selected. Without an engine, rolls can explore Godot, Phaser and GDevelop.

These are curated design combinations, not generated code or verified package compatibility. Keep the foundation's pinned engine version and inspect its actual files before selecting packages. The roll has no model calls or generation cost.

## Creator flow

1. Choose a foundation or describe an idea; roll or request suggestions.
2. Review the core loop, suggested components, real catalog skill links and acceptance test.
3. Open **Set up this build**. Select the delivery target and only needed optional services.
4. Mark access checkpoints as not checked, needs help or checked. Checkboxes are creator reports, not verification.
5. Review and copy the setup + build brief into the project’s `BUILD_PLAN.md` or agent conversation.

Attach setup to this project writes `state.setupPlan` (version 1) through project publish and the current `expectedHead`. The same plan is included in the Studio agent export, with a markdown receipt. Statuses remain user-reported, not verified. Until a project exists, the browser can hold the plan for the next Studio create. No tokens, passwords, cookies or private source logs belong in this checklist, the project, or the export.

## Agent contract

Read the recommended skills and record paths/versions actually read. Ask unresolved questions in concise batches, including the target platform, engine access, foundation location, budget and chosen providers. For example: “Will this run in the browser or desktop? Is Godot installed at the foundation’s required version? Do you want local assets or an external generator?”

Have the creator authenticate or configure secrets privately in the relevant provider/environment. Never ask them to paste secrets into a handoff. Explain which feature is blocked; continue independent work. User-reported ready items still require actual checks. Run the small acceptance trial before a full build and preserve commands, results and unresolved items in `BUILD_PLAN.md`. Respect existing authorization instead of repeatedly requesting it.

Hugging Face, Envato and external audio are optional; not every project needs a token or paid account. Setup includes engine-specific guidance and distinguishes Unreal from UEFN/Verse. The wizard does not install engines, authenticate providers, run an agent or prove compatibility.

## API and maintenance

- `GET /api/build-toolkit?idea=...&resourceId=...&projectId=...` returns contextual resources, a brief and setup requirements. Use a `projectId` from `GET /api/projects` or a `resourceId` from the catalog; do not invent either.
- `GET /api/build-toolkit/roll?idea=...&resourceId=...&projectId=...&previous=...` also returns a populated idea and blueprint. Send the previous blueprint ID to avoid an immediate duplicate.
- Preserve the original user idea as roll context; do not feed a generated engine back as a newly chosen constraint.
- `hub/server/buildBlueprints.mjs` owns curated profiles, components, themes and catalog skill IDs.
- `hub/server/buildSetup.mjs` owns engine guidance, setup checks and agent questions.
- `hub/client/src/components/toolkitSetup.ts` formats the reviewable handoff.

When adding a profile, use existing catalog skills, engine-native component concepts and an observable first-playable test. Add bounded validation tests for selection preservation, invalid requests and nonmatching engines. Run `npm test` and `npm run build` in `creator-hub/hub`, then inspect the roll and setup flow in the browser, including a narrow viewport.
