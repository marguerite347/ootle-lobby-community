# New Lore → weekly creator challenges

Create reads `GET /api/creator-ideas` on load or **Refresh insights**. The server reads
`content/creator-insights.json` every time (no restart needed for content edits).
Any user's agent can read the same endpoint. No credentials or generation credits
are required for this curated flow. This is not a live New Lore integration.

The log contains public question URLs, original editorial observations, reviewed
build proposals and the creator goals they support. Never add private dashboard
snapshots, user activity, credentials, or unpublished source logs.

## Weekly routine for a creator or their agent

1. Review public New Lore questions and current team goals. Treat questions as
   inspiration, not proof of demand, technical truth or measured SEO opportunity.
2. Update the committed log through the normal review workflow. Use a stable ID,
   source URL, `reviewedAt`, `expiresAt`, goal IDs, build brief, success check and
   reusable Hub links. Keep entries `draft` until reviewed; use `retired` to exclude
   an old proposal. Set a goal's `active` to false when it no longer applies.
3. Refresh Create or GET the API. It excludes unreviewed, future-dated, expired and
   inactive-goal entries. Three eligible proposals rotate each Monday at 00:00 UTC;
   they stay stable within a week while the log is unchanged. Editing the log may
   change that week's lineup. This is on-request computation, not a background job.
4. **Copy challenge brief** provides editable challenge copy with evidence and
   success criteria. **Start this idea** prefills the existing project form; the
   creator must submit it to save. No published weekly challenge is altered.
5. The challenge owner chooses and edits a proposal, verifies technical claims with
   current official Tari/Ootle sources and explicitly publishes through the existing
   challenge workflow. No rewards or deadlines are invented by these suggestions.
6. Review new source questions weekly and before expiry. Rotation alone cannot
   discover changes upstream. Record results in reviewed, sanitized lessons and
   revise future proposals: did users understand, finish a demo, or Riff it?

The initial four entries were editorially reviewed on 2026-09-23 and expire on
2026-12-23. All-expired logs show a review-needed empty state, not recycled claims.
Sources & freshness separately shows manual review and the lack of a live feed.

## Verification and reuse receipt

Reused Create, the Studio project form and Sources & freshness; added no dependencies,
models or paid generation. The smallest trial checked one week's deterministic API
selection and its complete evidence-linked brief. Tests cover Monday rollover,
expiry, future reviews, draft status and inactive goals. Frontend build and browser
checks cover visible suggestions and project prefilling. This delivers draft copy,
not automatic publishing, a New Lore API integration or a public deployment.

On `/create`, New Lore ideas live with the creator tools. The card is collapsed by default; expanding it loads the saved suggestions and exposes the evidence, brief-copy and start-project actions.
