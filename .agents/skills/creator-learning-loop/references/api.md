# Project lessons for creators and agents

Use `/skills/learning-loop` to select a project, save a private draft, inspect its
shared text, record a trial, and publish a reusable skill. Projects also link here
through **Capture a lesson**. The Skills page links to the same workflow.

An agent needs only Markdown and optional HTTP support. Use your reachable Hub
origin before each path. Localhost works only on the machine running that Hub.

## Start with an agent

Read `/agent-start.md`, then this guide. Search `/api/agent-resources?q=<task>` and
`/api/skill-market` first. Select one authorized session and one lesson. Draft the
public instructions separately from the minimal private evidence. Do not read the
whole user's history by default. No agent task or background process is launched by
opening this page.

## Identity and private drafts

The existing Ootle Lobby profile edit key controls your lessons. The browser stores
it with the profile in local storage. For a separate agent, supply it through that
agent's secret configuration, never a prompt, URL, source file or shared skill.
`POST /api/creator-profiles` creates a profile and returns `profile.id` and `editKey`.
Example body: `{"name":"Creator name","projects":[],"showWork":true,"showActivity":true}`.
If you already have a profile, reuse its identity instead of creating duplicates.

Private calls require `Authorization: Bearer <editKey>` and `creatorId` (query for
GET, JSON body for POST). Responses use `Cache-Control: no-store`. Drafts belong to
the profile, not every viewer of the source project. Project association supplies
context; it is not proof of project ownership. This remains a localhost prototype:
public hosting needs deployment authentication, HTTPS and account recovery. A
machine administrator can read local files; this is not encrypted storage.

## Create a draft

Find the source project ID in `GET /api/projects`. POST `/api/learning/lessons`:

```json
{
  "creatorId": "YOUR_PROFILE_ID",
  "projectId": "EXISTING_PROJECT_ID",
  "source": {
    "kind": "agent",
    "reference": "selected session or candidate ID",
    "excerpt": "Only the necessary evidence. Full logs remain local."
  },
  "content": {
    "title": "Preserve trailer audio balance through export",
    "description": "Check the export against the approved stereo mix before rendering a full trailer.",
    "purpose": "Use for trailers with separate mono narration and stereo music. This does not judge voice acting.",
    "requirements": "An editable timeline, source stems and an audio comparison tool.",
    "setup": "Choose a short speech-and-music section and retain the intended stereo reference.",
    "instructions": "Export the short section. Align it to the reference, compare relative stem levels, and correct routing if the balance changes. Preserve editable stems.",
    "verification": "Measure relative voice/music gain and listen to both versions. A decoding pass alone does not establish mix quality.",
    "recovery": "Return to the last known mix, correct channel mapping or master routing, and repeat the short test."
  }
}
```

This is an illustrative draft, not a passing trial or a certified audio recipe.
`source.kind` accepts `agent`, `manual`, or `beacon`. Evidence stays private. All
`content` fields, creator attribution, lesson ID, version and the latest trial
summary become public on publication. Text is bounded; raw files are not uploaded.

List your drafts: `GET /api/learning/lessons?creatorId=…&projectId=…`.
Every mutation below requires `creatorId` and the current numeric `expectedRevision`.
Use the returned revision for the next step. HTTP 409 means reload before retrying.
HTTP 403/404 means the supplied profile cannot access the lesson.

## Review, test, publish

POST `/api/learning/lessons/<id>/<action>` with:

| Action | Additional fields | Result |
| --- | --- | --- |
| `edit` | `content`: complete field mapping above | Returns to draft; prior review no longer qualifies |
| `review` | `sanitized:true`, `evidenceChecked:true`, `note`: private review rationale | Reviewed; obvious private paths/credential patterns are blocked |
| `trial` | See trial JSON below | Tested if accepted; otherwise reviewed and still unpublished |
| `publish` | `shareConfirmed:true` | Requires reviewed current content and latest successful trial; appears in library |
| `reject` | `reason`: private explanation | Candidate stays out of public discovery; edit to revisit |
| `retire` | `reason`: private explanation | Withdraws a published skill; already downloaded copies persist |

A caller's review/test assertions are recorded attestations, not independently
observed execution. Existing instructions still govern whether that agent is
allowed to review or publish for its user. Do not approve on the basis of a model's
confidence or a Beacon score alone. The review note is private; the trial summary
is public and must itself be sanitized.

```json
{
  "creatorId": "YOUR_PROFILE_ID",
  "expectedRevision": 2,
  "accepted": false,
  "summary": "Describe the actual outcome and its limits. This sentence becomes public if the lesson is later published with this trial.",
  "evidence": "Private artifact reference or necessary result excerpt",
  "comparison": "Describe how the two runs used equivalent tasks, quality criteria and provider units.",
  "baseline": {"corrections": null, "wastedGenerations": null, "minutes": null, "credits": null},
  "result": {"corrections": null, "wastedGenerations": null, "minutes": null, "credits": null}
}
```

Run the test outside the Hub, then set `accepted` from the observed outcome. Counts
must be nonnegative integers; minutes and credits may be fractional. Omitted/null
measurements are unknown. Zero means a measured zero. Change is result minus
baseline: negative means fewer units used. Raw metrics, evidence and comparison
context stay private. One trial does not prove general improvement or causation.

Published content is immutable. Create a new draft for changes, link the prior skill
in the sanitized instructions if useful, then withdraw the superseded one. Avoid
publishing duplicate guidance where updating a repository skill is more appropriate.

## Reuse and fork

Published lessons join `/api/skill-market` and `/api/agent-resources?q=…`.
`GET /api/learning/published` lists only published lessons.
`GET /agent-skills/<lesson-id>/SKILL.md` serves portable instructions.
`GET /agent-skills/<lesson-id>/bundle.json` includes `files`, version and SHA-256 hashes.
The normal Skills download produces a ZIP. No account is needed to read these files.

Inspect the Markdown, preserve its folder, and install under your agent's project
skill location only when authorized. Read-only agents can use the Markdown directly.
When forking a project, copy/pin the published bundle and its hash into that fork's
workflow notes. Private drafts/logs are not automatically inherited by forks. Hashes
identify content, not safety. Withdrawn skills disappear from new downloads.

## Beacon

Beacon is optional. This integration is a documented **candidate handoff**, not a
background collector, MCP server or automatically configured Jev connection.

In your own Beacon environment, select one trace and inspect the dry run:

```sh
beacon memory evaluations run --dry-run --trace SELECTED_TRACE_ID --project PROJECT_PATH
```

The dry run makes no evaluator request. If you elect to evaluate externally, inspect
the exact selected data and configured endpoint first. A non-dry-run evaluation uses
the configured Jev endpoint (hosted TypeSafe by default) and may incur provider cost:

```sh
beacon memory evaluations run --trace SELECTED_TRACE_ID --project PROJECT_PATH
beacon memory candidates list --state pending --project PROJECT_PATH
beacon memory candidates show CANDIDATE_ID --project PROJECT_PATH --json
```

Keep that output private. Have your agent inspect it and map the minimum necessary
evidence and sanitized instructions to the draft envelope above, using
`source.kind:"beacon"` and the candidate ID as the reference. The Hub intentionally
does not assume a third-party candidate JSON schema or execute pasted commands.
A Beacon approval does not skip this Hub's privacy review and trial gates.

Primary references checked September 22, 2026:
- [Beacon cross-harness memory](https://github.com/Asymptote-Labs/agent-beacon/blob/main/docs/concepts/cross-harness-memory.mdx)
- [Beacon memory CLI](https://github.com/Asymptote-Labs/agent-beacon/blob/main/docs/cli/memory.mdx)

The Hub makes **no external evaluator requests**. There is no API-key field for Jev
and no automatic session scanning. Enable external evaluation only in your own
explicitly configured Beacon workflow; do not treat this guide as authorization.
