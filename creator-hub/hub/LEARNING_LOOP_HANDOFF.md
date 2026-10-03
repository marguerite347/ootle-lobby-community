# Creator learning loop — implementation handoff

## Reuse selection

Reuse the existing creator profile edit-key authentication, Skills marketplace,
portable agent bundles, resource-first workflow and project IDs. The gap was a
reviewable path from selected evidence to a skill, not another model or renderer.
Beacon's published memory documentation was reviewed on September 22, 2026; the
integration is a candidate handoff. No third-party code or evaluator was installed.

## Delivered

- Creator workbench at `/skills/learning-loop`, linked from Projects and Skills.
- Profile-owned draft evidence with private source reference, excerpt hash and
  source project revision; public fields are stored separately.
- Review, edit, trial, publish, reject and withdrawal with revision conflict checks.
- Edits invalidate review; the latest trial must pass after review; published
  content is immutable. Creator-reported testing is explicitly labeled.
- Public Skills listing, agent search entry, Markdown and hashed portable bundle
  all derive from one lesson record. No second authoritative marketplace copy.
- Before/after measurements of corrections, wasted generations, minutes and credits.
  Missing values remain unknown. No savings or causal improvement are asserted.
- Canonical portable skill and API/Beacon guide, served at `/learning-loop.md`.

## Evidence and limits

Initial bounded trial: domain tests verified review/test gates, stale-write conflicts,
privacy separation and marketplace delivery before the UI was built.

Final validation: 141 server tests, 40 client tests, client build and skill validator
passed. HTTP tests cover wrong/missing credentials, cross-owner access, all public
surfaces, download privacy, unknown projects and retirement. Private data and keys
are excluded from listings and bundles. The existing Vite warning about Challenges
being both statically and dynamically imported remains unrelated to this change.

An isolated browser instance exercised profile creation, project selection, private
draft creation, review, trial with unknown metrics and skill publication. The fixture
was not added to the user's live creator library. Desktop and 390px layouts were
inspected; mobile had no horizontal overflow. No external evaluator was called.

This is local prototype functionality, not deployed account infrastructure. Retain
private-learning state in a persistent runtime directory; its file permissions do
not encrypt it from machine administrators. Review/acceptance fields are caller
attestations. An actual improvement study still needs comparable real runs.
Beacon capture, Jev configuration/evaluation, automatic extraction and automatic
installation remain outside the Hub; the documented handoff supports any agent that
can inspect selected local evidence and submit the normalized draft envelope.
