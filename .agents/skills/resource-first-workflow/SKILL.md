---
name: resource-first-workflow
description: Before starting a non-trivial project or changing implementation strategy, identify and reuse suitable existing skills, tools, assets and proven workflows. Use before installing dependencies, downloading models, writing a new pipeline or retrying a failed approach, and record a selection receipt in the handoff.
---

# Resource-first workflow

Spend a small amount on discovery to avoid spending heavily on the wrong implementation. Select the best relevant capabilities; do not load or use everything simply because it exists. A named user preference takes priority.

## Before implementation

1. Define the observable result and its acceptance check in one or two sentences. Include the user's quality bar (for example, expressive trailer narration), not just a technical output (an audio file).
2. Search **existing resources first**, using metadata before full instructions:
   - Current project: AGENTS.md, package manifests, scripts, resource/provider catalogs, existing examples and prior output manifests. Identify the serving checkout for local app work.
   - Available skill descriptions and tool/plugin metadata in this session. Search task synonyms. Read only the best matching skill entrypoints and their necessary references.
   - Relevant memory or prior task evidence when available. Check its date and scope; do not assume an old success is current.
   - Use `python3 <skill-directory>/scripts/discover.py --repo <project-root> "task words"` for a bounded local shortlist. `--installed <skills-directory>` can include installed skill metadata. This helper cannot see runtime connectors, external accounts or all files on the machine; inspect available tool metadata separately.
3. Choose the strongest existing workflow that meets the actual task. Compare a few plausible candidates on output quality, current availability, task fit, setup effort, runtime/cost, and reusable editable outputs. Record why a new implementation is necessary if none fits. External research comes after local discovery, except when the user asks for it or current API/license facts need verification.
4. Distinguish **catalogued → installed → callable → verified for this use**. A library entry is not an installed engine; an installed plugin is not an authenticated service; a passing render is not proof of good voice acting. Check only the prerequisites needed for the selected path.
5. Run the smallest representative trial **before** expensive generation, a large download, full rendering or broad implementation. Use the real acceptance criterion. For audio, audition a short dry performance before scoring/rendering the full film; for integration, test one resource end to end before bulk importing. If evaluation requires listening or visual inspection you cannot perform, say so; do not infer quality from metadata.
6. State a compact selection receipt in the task update: **reuse / why / availability check / trial / remaining gap**. For repository implementation, preserve this in the PR or existing task handoff using [the record format](references/selection-record.md). Tiny self-contained edits need only a brief relevant-code check, not this full process.

## While working

- Use the chosen workflow's actual entrypoint, pinned versions, templates and checks. Do not quietly substitute a newly invented pipeline after claiming reuse.
- After two attempts with the same failure and no new evidence, diagnose or switch hypotheses. Do not repeat a full expensive run to test a small change. State the concrete blocker when further progress requires unavailable access or user input.
- Before changing strategies, revisit the shortlist and explain the evidence that warrants the switch. Reuse cached inputs and working intermediate artifacts.
- Save successful commands, versions, source links, editable artifacts and acceptance evidence in the owning project handoff. Record a failed approach and its cause only when useful for avoiding recurrence. Do not change memories unless the user explicitly requested a memory update.
- Promote a workflow to “verified” only for the scope actually tested. Update the canonical skill after evidence supports a correction; synchronize authorized installed copies. Remove superseded advice rather than adding contradictory rules.

## Enforcement boundary

AGENTS.md and installed skills guide agents; they do not force compliance or retrain a model. The selection receipt makes reuse reviewable. Automated checks can verify files and evidence references, not whether a creative result meets the user's taste. Do not call this guaranteed compliance or an automatic learning system.
