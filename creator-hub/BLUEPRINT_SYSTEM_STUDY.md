# Blueprint-inspired Ootle Lobby workflows

Deferred revisit: [#157](https://github.com/marguerite347/tari-growth/issues/157).
Coordinate future agent adapters with [the agent plan](AGENT_OOTLE_IMPLEMENTATION_PLAN.md);
this tracking issue does not change current editor capabilities.


Research and proposed implementation, 2026-09-23. This document does not claim a
new editor or execution engine has been implemented.

## Existing foundation

`hub/client/src/WorkflowEditor.tsx` provides draggable nodes, an inspector,
connections, full JSON exchange and ComfyUI API prompt import/export.
`hub/shared/workflow.mjs` validates version 1 graphs, roles, IDs, references,
coordinates, duplicate ComfyUI inputs and cycles. Project history and forks
preserve the diagram; see WORKFLOW_AGENT_GUIDE.md for expectedHead updates.

Design edges describe intent; ComfyUI edges encode external inputs. Neither is
an in-Hub execution trace. ComfyUI port types and runtime availability are not
currently checked. There is no gameplay runtime, debugger or reusable subgraph
contract. Preserve these distinctions during migration.

## What to learn from Unreal

- **Typed pins and contextual node creation:** show what a node accepts and
  produces, and offer compatible next steps when connecting. Explain invalid
  connections at the pin. Keep execution order distinct from data dependencies.
- **Inspectable execution:** Unreal's debugger exposes breakpoints, watches and
  active execution wires. In the Hub, animate wires only from real execution
  events; previews must be explicitly labeled simulations.
- **Reusable graphs:** collapse visual clutter, but distinguish organizational
  groups from callable, versioned subgraphs. Promote a tested sequence into a
  reusable community recipe with defined inputs, outputs and dependencies.
- **Event-driven mechanics:** model meaningful events and explicit branches,
  rather than defaulting to continuous polling.

These are interaction and architecture references, not .uasset import support,
Unreal compatibility, or a plan to embed the Unreal runtime in a web page.

## First vertical slice

Use the existing card-game prototype to demonstrate a proposed logic sandbox:

Select hand -> calculate base score -> apply multiplier -> compare with target
-> success/failure output -> show score breakdown.

Expose the multiplier and target as editable controls. The original and remixed
rules run against the same fixed hand and seed. Show intermediate values, the
path taken and the resulting score. Start with explicit, pure local functions;
no arbitrary code evaluation, paid calls, wallet writes or deployment.
The initial sandbox is not automatically wired to the playable game. Connecting
it requires an adapter and parity tests against the game's actual scoring code.

## Suggested tickets, in order

### BP-01: Canvas usability (proposed)
Reuse the saved graph and project history. Add pan/zoom, fit-to-view, undo/redo,
keyboard selection and a persistent inspector beside the canvas. Provide a
searchable node library sourced from existing catalog/skill registrations.
Acceptance: reopen and fork existing graphs unchanged; keyboard and mobile
users can select/edit nodes; a drag is one undo step; no viewport jump on select.

### BP-02: Versioned node and port contracts (proposed)
Define node type/version, named typed inputs/outputs, defaults, configuration,
execution capability and provider prerequisites in a registry. Reference existing
resources and skills rather than duplicating their instructions. Validate both
server and client. Unknown provider schemas remain explicitly unvalidated.
Add compatible-node suggestions, pin wiring and node-specific diagnostics.
Acceptance: reject incompatible types, missing required inputs and duplicate
bindings; preserve unresolved nodes without silently dropping data. Migrate v1
through a tested explicit schema migration; old design edges remain annotations.

### BP-03: Deterministic game-logic sandbox (proposed)
Implement only the local allowlisted scoring nodes needed for the vertical slice.
Support reset, step, run, watched values and error location. Record node ID,
input/output snapshots and run ID. Separate run traces from graph definitions.
Acceptance: identical inputs/seed give identical results; changing one multiplier
explains the output difference; execution limits prevent unbounded work; failing
nodes never report success. Compare against the real game before claiming parity.

### BP-04: Reusable, forkable recipes (proposed)
Add groups/comments first, then callable subgraphs with stable input/output
contracts, pinned versions, source attribution and fixtures. Allow inspection
before installation and review of upgrades; do not mutate existing projects when
a shared recipe changes.
Acceptance: export, import, save, fork and historical restore preserve behavior;
changed node versions produce a reviewable diff and migration diagnostics.

### BP-05: Creator production adapters (proposed)
Extend proven contracts to ComfyUI, audio, media and engine tools. Resolve real
provider schemas; show missing access, estimated cost and output artifacts.
Support review gates, cancellation and resumable jobs. Cache only where the
provider permits it, keyed by inputs, node/model versions and relevant settings.
Acceptance: changed inputs invalidate dependent results; unaffected valid outputs
are reused; external actions require the applicable authorization; secrets never
enter graph JSON or Git. Design notes never become executable implicitly.

## Open decisions

- Choose a canvas library only after testing existing dependency fit, accessibility,
  graph persistence and the 80-node limit. Do not assume a rewrite is necessary.
- Is the first sandbox purely an explanation tool or the game's authoritative
  rules engine? Start with the former and require parity before adopting the latter.
- Who can publish executable node types, and how are implementations reviewed?
- Which runtimes can actually be reached, and where do credentials/jobs live?
  Cloud deployment remains deferred; no new cloud dependency for the local sandbox.
- Trace retention, private input handling and per-provider retry/cost semantics
  need contracts before external execution is enabled.

## Success criteria

Measure task completion with a fixed original/remix exercise: time to a working
rule change, incorrect connections resolved without assistance, repeated agent
corrections and paid generations avoided by previewing or reusing outputs. Record
a baseline; do not invent savings. A creator should be able to explain the result
and an agent should reproduce it from the committed graph and fixtures.

## Sources and reuse receipt

Reused repository workflow schema, editor and agent handoff; consulted the
installed unreal-blueprints skill. Official Epic references reviewed:

- https://dev.epicgames.com/documentation/unreal-engine/nodes-in-unreal-engine
- https://dev.epicgames.com/documentation/unreal-engine/overview-of-blueprints-visual-scripting-in-unreal-engine
- https://dev.epicgames.com/documentation/unreal-engine/collapsing-graphs-in-unreal-engine
- https://dev.epicgames.com/documentation/unreal-engine/blueprint-debugging-example-in-unreal-engine

These are proposed tickets, not opened issues or implemented features.
