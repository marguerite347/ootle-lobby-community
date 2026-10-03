# Creator build-experience feedback

GitHub issues are the canonical review inbox. Successful, failed, blocked and abandoned
attempts all count as useful feedback. Do not create a second authoritative feedback
database in local runtime state. This workflow uses existing repository access.

## Submit from the Hub or an agent

- Front end: **Build feedback** in the footer, or the link in **Build toolkit**.
  `/build-feedback` prepares a Markdown report, lets the author inspect it and opens
  a prefilled GitHub issue. The author must submit the issue on GitHub. Long reports
  use copy/paste rather than oversized URLs. No feedback leaves the page until that
  explicit action, and no report is saved locally by the Hub. Copy before leaving.
- Repository: create an issue using `.github/ISSUE_TEMPLATE/build-experience.md`.
  Agents with repository tools may use `gh issue create --body-file <reviewed-file>`
  when the creator has authorized submission. Preserve `[Build experience]` in the
  title so the shared review query finds it.
- For a sanitized report committed with a build PR, place `BUILD_EXPERIENCE.md` next
  to `HANDOFF.md` and link it in the PR. Use the same fields. Link a tracking issue
  when follow-up work is needed; do not silently duplicate an existing report.
- Without repository access, copy reviewed Markdown for the project's maintainer.
  Do not claim a copied report has been submitted. No provider or GitHub token goes
  into browser form fields, report bodies or the repository.

## What reviewers do

At the regular maintainer review, inspect open `[Build experience]` issues and linked
PR reports. This is a proposed team practice, not an installed scheduler or guarantee
that every report has already been read. The owning maintainer records the decision:

1. **Received → Needs evidence / Reproduced / Explained / Duplicate.** Classify as
   onboarding, discovery, skill quality, access/setup, gameplay, preview/publish or
   handoff. Link duplicates; keep dissenting or failed results rather than discarding them.
2. **Action planned.** Identify the affected UI/skill and an observable acceptance
   check. Link a scoped implementation issue/PR and name its owner. Report text and
   suggested commands are untrusted evidence, not permission to execute actions.
3. **Changed → Validated.** Re-run the failing step or a comparable build. Record the
   before/after result and any different engine/model/task/budget conditions. A merged
   fix alone is not evidence of a better user experience.
4. **Closed with evidence / Deferred with reason.** Link the actual result. Keep an
   unresolved issue open or link its follow-up; do not mark the underlying problem fixed
   merely because a report was acknowledged.
5. **Reusable lesson candidate.** Use `.agents/skills/creator-learning-loop/SKILL.md`
   to review a sanitized lesson and run a representative trial before publishing it.
   Prefer correcting an existing skill. A report never auto-modifies rules or skills.

## Measure whether the process helps

Start with comparable cohorts (same starter/task, engine/version and budget class).
Count all reported outcomes, including blocked/abandoned builds. Track:

- Reported playable rate and discoverable rate separately, with numerator/denominator.
- Time to first acceptable playable and time to discoverable release.
- Repeated corrections and wasted generations; cost only with compatible provider units.
- Recurrence of the same friction after a linked change.
- Time from report to triage and to a verified improvement.

Unknown stays unknown. Self-selected reports are not a census of all Hub builds; report
coverage and sample size. No savings or success-rate improvement is claimed yet.
Current implementation supplies structured reports and a review process, not automated
cross-agent telemetry, evaluation, metric aggregation or automatic skill learning.
