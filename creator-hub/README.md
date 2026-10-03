# Ootle Lobby implementation home

The `creator-hub/` folder keeps its original technical name. The working Express + React/TypeScript prototype lives in [hub/](hub/README.md). Start there for development commands, or read [CREATOR_HUB.md](../CREATOR_HUB.md) for product direction and [docs/PLAN.md](../docs/PLAN.md) for the current milestones.

Visual and UI work follows the [Ootle Lobby Design System](design-system/README.md): tokens, components, marks and art direction for every page, game, video and cover. Naming and voice live in [BRAND.md](BRAND.md).

Add code and reviewed content using the [contributor workflow](../CONTRIBUTING.md). Small changes can go directly to main; use PRs when they help coordination. Do not import internal planning documents into public website assets.

## Asset library

[Assets in the creation journey](ASSET_LIBRARY.md): browse packs, game assets and creation workflows, upload community files, and attach resources to projects.

## Editable creation workflow

Every project has a node canvas for frameworks, Tari templates, AI tools and ComfyUI API graphs. Diagrams are versioned with the project. See the [creator and agent guide](WORKFLOW_AGENT_GUIDE.md) for editing, import/export, concurrency and runtime boundaries.

## Design library

- [Template marketplace](TEMPLATE_MARKETPLACE.md): discovery, indexing, versions and Riff relationships.
- [TariSkills](TARISKILLS.md): native protocol education for people and agents.
- [Modding ecosystems](MODDING_ECOSYSTEMS.md): external learning sources and qualifications.
- [Economy design](ECONOMY_DESIGN.md): models, transactions and [runnable budget example](examples/shop_economy.py).
- [Achievements](ACHIEVEMENTS.md): contribution recognition and proposed unlocks.
- [Community governance](resources/governance.md): Private Ballot and proposed voting workflows for game balance and project direction.
- [Optional Meta resources](META_ADS_KIT.md): explanatory library entries and examples.

Specifications are proposals. Consult each linked CH issue for acceptance and current implementation state.

- [Community game and app jams](COMMUNITY_JAMS.md): AI-friendly weekly challenges, calendar cadence, original prompt bank and measurement.

## Source library

[Browse resource buckets](resources/README.md) for AI creation, market research/promotion, game design, Godot projects and Ootle apps. These are curated references, distinct from the design specifications above.

- [Capture & Promote](VIDEO_WORKFLOWS.md): optional gameplay capture, branded clips, social distribution, in-app playback and analytics.

- [Audio resources](resources/audio.md): discover sounds/music, generate effects, transcribe footage and use audio in games or promotional clips.

- [Repo-local agent game skills](../skills/README.md): pinned game-making library and onboarding for contributor agents.

## Deferred cloud and decentralized architecture

[Developer implementation plan](DECENTRALIZED_HUB_IMPLEMENTATION_PLAN.md): proposed
Tari Ootle release registry, cloud/serverless storage, creator flows, suggested ticket
scopes, acceptance checks and unresolved access questions. Deferred so rapid prototyping
can continue; no migration or deployment is authorized by the document.

## Resume from another machine

Clone the repo and follow the [app README](hub/README.md). Daily Spark reward media
sources are committed in Git LFS under [handoff/reward-proof/](handoff/reward-proof/README.md),
with a manifest, checksums and a restore helper.

## Idea rolls and setup handoff

[Build toolkit and setup wizard](BUILD_TOOLKIT_SETUP.md): curate a playable structure, choose matching skills, and hand unresolved access questions to the agent before implementation.

## AI Asset Generator Hub design

[Development plan](AI_ASSET_GENERATOR_IMPLEMENTATION_PLAN.md) maps Scenario, Rosebud and Meshy creator flows to project-aware recipes, Hugging Face/open-model workers, fal Meshy and OpenRouter connections. Includes UX, provider boundaries, evaluation, backlog and unresolved access. Proposed, not connected runtime functionality.
