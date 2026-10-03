# Production review before expensive work

Use the project's **Creative review** board before another full cinematic render.
It is versioned in `state.productionReview`, not a separate authoritative tracker.
This is a local collaboration control, not authentication or a provider budget firewall.
Any creator's agent can use the project HTTP API; it need not run in Codex.

1. Search assets/tools and verify editor compatibility. A stock-template subscription
   does not establish that its After Effects/Premiere project can run in a browser.
2. Save the story/script and acceptance criteria, then the exact artifact/version.
   Ask the creator to approve actual creative material, not just the plan.
3. Prepare a storyboard with shot IDs, camera movement, duration, purpose, source,
   license/editor requirements and real-gameplay versus concept distinction.
4. Make one 10–15 second representative proof with the intended voice, score,
   captions and imagery. After script/storyboard approval, `node render.mjs OUTPUT STATE_JSON --proof` renders at most 15 seconds at half resolution using existing assets. Reuse accepted assets; change the failed dimension only.
5. Save each stage before approving it. The creator's explicit decision supplies
   status `approved`, reviewer and feedback. Agents must not infer taste approval
   from tests, generation completion or their own confidence. Approvals are recorded
   attestations; the Hub cannot authenticate who typed the reviewer name.
6. Only after the first three gates pass, render the full cut. The House film renderer
   now requires a saved state file: `node render.mjs OUTPUT STATE_JSON`.
   Use the current project's state, not an earlier approved snapshot. Material edits
   must first update the matching gate's artifact/version, reopening approvals.
7. Keep final-cut approval separate from technical export validation. A local render
   does not publish or deploy anything. No paid generation is automatically launched
   or authorized by a board decision. Obtain the provider's quoted cost and explicit
   spend scope before a charge; a remaining-credit balance is not a budget.

## Agent contract

GET `/api/projects/:id`; preserve all state fields. Edit `state.productionReview`
(version 1), and POST `/api/projects/:id/publish` with complete state, current
`expectedHead`, meaningful message and author. A stale head returns 409; reload and
reconcile without overwriting new feedback. Read back the committed state.

Gate IDs: `brief`, `storyboard`, `sample`, `final`. Each contains content, artifact,
status (`pending`, `changes`, `approved`), reviewer, feedback. Upstream content or
artifact changes invalidate downstream decisions on the server. New forks retain
references and feedback, but reset decisions. Decisions do not automatically detect
changed file bytes: record a content hash or immutable artifact version.

Attempts contain shot, provider, unit, cost, minutes, corrections, artifact, feedback
and result (`pending`, `accepted`, `rejected`). Measurements are null when unknown;
zero means measured zero. Do not reconstruct historical spend from guesses. Compare
like tasks/provider units, time to acceptable result and repeated corrections.
An unchanged generation retry needs a diagnosed reason; after two failed attempts,
revisit the asset/tool choice before spending again.

The board is project-visible and inherited by forks, not private source storage.
Keep raw sessions, account details and license certificates elsewhere. For reusable
lessons, use `/skills/learning-loop` and its private evidence, sanitization and trial
steps. Only reviewed, proven, portable instructions belong in shared skills.
Beacon/Jev remains optional and external evaluation requires a separate explicit
connection. A passing preflight does not establish a reduction in wasted credits.
