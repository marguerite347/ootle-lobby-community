# Creator Studio

Studio is the integrated blueprint workspace at `/studio`, linked from Create and
individual projects. It builds on the existing version-1 workflow graph and Git-backed
project store. The older project-details form remains at `/create/project`; legacy
`/studio?template=...` and `?idea=...` links retain that setup behavior.

## Working flow

1. Choose Character to playable, An asset with a purpose, One great game loop, or
   Make the win unforgettable. Each scaffolds editable design nodes and connections.
2. Name the project and describe the idea. Inspect Blueprint, Parts & skills and
   Access & setup. Nodes index their purpose and point to skills/resource searches.
3. Add/edit/move/remove nodes and connections using the existing workflow editor.
   ComfyUI API JSON import/export retains its existing behavior.
4. Create Studio project. The initial commit includes the entire validated graph.
5. Open the asset library with project context to attach resources. Return through
   the project's Open in Studio link to load the saved graph. Save existing projects
   with expectedHead; conflicts preserve the draft and require reconciliation.
6. Export agent handoff downloads one JSON file: project identity, the workflow
   graph, `state.setupPlan` when attached, and a markdown setup receipt. It is
   `execution: design-only`, `accessStatuses: user-reported-not-verified`, and
   `playablePublish: not-claimed`. No model executes from this download.
7. Project versions and forks retain Studio workflows through the existing store.

The recipe index is `hub/shared/studio.mjs`. Both client and read-only agent endpoint
`GET /api/studio/recipes` consume it. Stage definitions include role, task purpose,
skill/resource search term and workbench route. Custom nodes also appear in the index;
resourceId links refer to attached catalog records, not invented provider integrations.

## Availability and scope

Implemented: recipe scaffolding, editable graphs, node search, resource/skill navigation,
asset-library handoff, access guidance, atomic initial graph save, version saves,
existing project reopening and portable blueprint export. Setup links reuse the toolkit
wizard on Create. A setup plan saved from that wizard is durable project state
(`state.setupPlan`, version 1). Its statuses are creator self-reports, not verified
access, and attaching or saving it does not publish a playable. No new credentials,
subscriptions or paid calls are made.

Not implemented: provider execution, an inference queue, key vault/BYOK UI, automatic
rigging, motion retargeting, rigged character packs, 3D playable preview and engine export
adapters. These must be built and tested before marking a node runnable or its output
verified. All recipe edges are design edges. Rigging and animation are represented as
separate reviewable stages; this is not a claim that UniRig, Meshy or motion libraries
are installed. See AI_ASSET_GENERATOR_IMPLEMENTATION_PLAN.md for the execution backlog.

Project state uses the current runtime store; remote storage and authenticated tenancy
remain deferred under issue #156. Committing this Studio implementation does not sync
private creator projects to the source repository. Export is portable blueprint data,
not a backup of binaries or a compiled game. Never put tokens in graph fields.

## Resource selection receipt

Read resource-first-workflow, readable-code, native TariSkills router/README (no chain
execution in this feature), frontend-design, WORKFLOW_AGENT_GUIDE and AGENT_START.
Reused WorkflowEditor, workflow validator, project store, asset attachment and toolkit
setup rather than adding another graph library, storage backend or provider abstraction.
The existing graph is sufficient for scaffolding and indexing requested here; execution
is a distinct capability that must not be implied by a visual connection.

Representative trial: scaffold and validate all four recipes; create a character project
with its graph atomically; reject malformed graph without creating a project; browser
create → add deformation-review node → save → reload. The edited node survived reload.
Full existing tests and client build passed. Desktop and 390px layout checked (no page
horizontal overflow). The graph itself intentionally scrolls. No provider job, rigging
operation or engine export was executed. Future acceptance must include actual artifacts.
