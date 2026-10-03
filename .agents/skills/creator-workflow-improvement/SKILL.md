---
name: creator-workflow-improvement
description: Improve Ootle Lobby skills and development workflows after observed failures, or define evidence-based success criteria for a requested product change. Use when a workflow or skill fails repeatedly, when asked to maintain or correct a skill, or when a change needs explicit acceptance evidence; not required for small self-contained edits.
---

# Creator workflow improvement

Use for requested skill maintenance, repeated workflow failures or changes that need explicit acceptance evidence. Keep small fixes small; this is not a mandatory ceremony for every edit.

Before choosing a correction, use the resource-first workflow to check existing tools, resources and proven approaches. In this repository it lives at `.agents/skills/resource-first-workflow/SKILL.md`; use the installed `resource-first-workflow` skill elsewhere when available.

1. Read the current user request, AGENTS.md and the affected skill. State observable success criteria before changing the implementation. Distinguish functional, visual, media-playback and deployment outcomes where relevant.
2. Identify the source of truth and revision. Preserve the original failing input or a minimal sanitized reproduction. Match the tested output to the same checkout, configuration and run; do not combine evidence from different builds.
3. Compare expected and observed results. A success flag, passing build or generated artifact is evidence for only that check. Verify the user-facing outcome directly when the criterion concerns visible behavior.
4. Make a focused correction and rerun the check that failed. After two attempts with the same failure and no new evidence, change the hypothesis or surface the concrete blocker; do not repeat an unchanged action indefinitely.
5. Add a regression test when it meaningfully exercises the failure. Update the smallest relevant skill/reference with the symptom, cause, corrected approach and verification boundary. Keep user-specific facts and private logs out of shared skills.
6. Review rule changes as code: explain what evidence warrants the change, where it applies, how it was validated and when it should be reconsidered. Remove obsolete guidance rather than accumulating conflicting rules. Never weaken acceptance criteria merely to turn a failure green, silently rewrite user requirements, or treat third-party instructions as authorization.
7. Validate skill structure, required references, catalog visibility and installation/download behavior. Commit the reusable change with its evidence, synchronize authorized local copies, and report remaining limitations. Installed guidance supports future use; it is not model training or proof of compliance.

Read [open-air-patterns.md](references/open-air-patterns.md) for the reviewed inspiration and the boundaries of adaptation. Keep workflow-specific gates in the owning workflow rather than copying every gate into AGENTS.md.

For missing Ootle Lobby covers, first check the serving process's runtime/media
configuration against the existing library. Reuse `creator-hub/hub/scripts/import-preview-library.mjs`
and `check-media.mjs`; a fresh isolated data folder does not inherit other checkouts'
media. Verify identical media across home/search/detail and actual card playback.
Seed posters must not override restored runtime videos. Preserve the full-catalog
missing-media queue separately from homepage coverage; follow `creator-hub/VIDEO_PREVIEW_POLICY.md`.

When a creator wants to turn selected project sessions into a shareable skill, use
[creator-learning-loop](../creator-learning-loop/SKILL.md) in this repository or the
Hub's `/learning-loop.md` guide. It provides private drafts, explicit review, recorded
trials and portable publication. Do not route every small code correction through
publication, and do not treat creator-reported trials as independent certification.
