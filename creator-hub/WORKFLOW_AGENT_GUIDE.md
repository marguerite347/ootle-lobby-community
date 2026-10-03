# Creator workflow canvas: agent handoff

The project page contains an editable creation workflow. It describes frameworks, Tari templates, AI tools, outputs and their purpose. It is not a deployed integration or a ComfyUI server. Source: `hub/shared/workflow.mjs`; UI: `hub/client/src/WorkflowEditor.tsx`.

## Creator flow
Choose a starting framework, create a project, then use Creation workflow. Selected resources seed nodes. Add missing project resources after attaching new references. Add nodes, edit purpose and source, drag handles or edit coordinates, and connect nodes. Removing a node removes its edges. Save state records the graph alongside notes and recipe in Git. Forking a historical version preserves that graph.

The graph is independent of the attached-resource list after seeding. Removing a graph node does not uninstall a dependency or remove a resource reference. Adding a node does not install software.

## Agent update checklist
1. GET `/api/projects/:id` from the configured hub origin. Read `state` and `head` and preserve all existing state fields.
2. Inspect the base framework, recipe, resource IDs and existing diagram before editing. Use real catalog resource IDs when known. Do not invent compatibility or Tari addresses.
3. Edit `state.workflow`, version 1, with `nodes` and `edges`. Nodes require unique safe `id`, `role` (framework/tari/ai/comfyui/tool/output), `title`, `purpose`, and numeric x/y between 0 and 3000. Optional `resourceId` and http(s) `url` provide provenance. Maximum 80 nodes / 160 edges.
4. Design edges require unique `id`, `from`, `to`, `kind: "design"`, and `label`. They document intent only. Explain what data passes through each connection.
5. ComfyUI nodes have `comfy: {classType, values}`; values are literal strings/numbers/booleans. Comfy edges use `kind: "comfy"`, target `input` name, and source `output` slot. Each input has one source or one literal, never both. Cycles are rejected. Port types, models and runtime compatibility still need validation in ComfyUI.
6. Run `validateWorkflow` from the shared module. POST `/api/projects/:id/publish` with the complete `state`, fetched `expectedHead`, a meaningful `message`, and attribution `author`. Workflow changes require expectedHead. On 409, fetch fresh state and reconcile; never blindly retry with the new head.
7. Read back the project and verify the new head and saved workflow. If `state.setupPlan` is present, read it and the Studio export receipt. `ready` is a creator self-report, not Hub verification. Ask unresolved `ask` fields in batches, have the creator configure secrets privately, and record one small trial without secrets. Leave the version message and PR handoff explaining changes, evidence and remaining runtime checks.

## ComfyUI exchange
The UI imports API prompt JSON, not ComfyUI's editor-format workflow JSON. Import adds nodes with fresh IDs. Export includes only ComfyUI nodes and bindings; design edges are deliberately excluded. Full diagram JSON supports round trips for agents. Replacement replaces the whole diagram, so export first if needed.

`GET /api/workflows/comfy-example` supplies the existing SDXL concept-background example. It requires the named SDXL checkpoint and a separately configured ComfyUI installation. This is an image workflow usable as a video asset, not a complete video generator. No render queue, paid API invocation or wallet transaction is triggered by this editor. Do not put tokens, prompts containing private data, or credentials in versioned graphs. Use configured secret storage for runtime credentials.

## Validation
Run `npm test` and `npm run build` in `creator-hub/hub`. Test import/export, missing references, duplicate input bindings, removal cleanup, history and stale-head behavior. Live render verification is separate and must report actual runtime/model results. Tari composition requires the relevant TariSkills tests and deployment evidence separately.

## Video thumbnails

All agents and ComfyUI/Remotion thumbnail workflows must follow [VIDEO_PREVIEW_POLICY.md](VIDEO_PREVIEW_POLICY.md). Create bespoke animated album artwork about each resource, with its own concept, composition, imagery and motion. Metaphorical or illustrative feature art is welcome; reproducing the actual UI is not required. Shared generic animations with renamed labels or recolored scenes are prohibited. Review existing feature illustrations individually and verify the artwork in the live card.

## Blueprint-inspired evolution

See [BLUEPRINT_SYSTEM_STUDY.md](BLUEPRINT_SYSTEM_STUDY.md) for the Unreal Blueprint
research, proposed implementation sequence and acceptance criteria. This is a
future design; current version 1 graphs retain the behavior described above.

## Studio scaffolding and indexing

`/studio` now provides recipe scaffolds and a searchable Parts & skills view over this
same graph. Read `/api/studio/recipes` for the shared stage index. Open an existing
project at `/studio?project=<id>`; initial creation accepts a validated `workflow` on
`POST /api/projects`. See [STUDIO.md](STUDIO.md) for the working flow and execution
boundaries. Saving a blueprint never invokes a provider or installs a model.
