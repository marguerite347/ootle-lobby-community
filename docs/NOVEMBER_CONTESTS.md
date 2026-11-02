# November 2026 contests

Organizer sources checked November 2, 2026:

- [MVP build contest, topic 520](https://community.tari.com/t/november-build-contest-thread-mvp/520): both public code and a working app are required. Previous contest code may be reused with meaningful innovation; this month's exception overrides the earlier no-reuse rule. Announcements qualify on Bluesky, Reddit, Medium or YouTube.
- [Monthly rules, topic 323](https://community.tari.com/t/ootle-launch-date-and-launch-contest-rules/323/1): 1M / 500K / 250K XTM placements and a cutoff at the beginning of the next month, giving December 1 at 00:00 UTC for November. OSI-approved license and Council/Tari Labs eligibility exclusions still apply.
- [First to Launch, topic 521](https://community.tari.com/t/november-bonus-contest-first-to-launch/521): 100K XTM for each of the first 20 qualifying mainnet launches from existing contest entries. Ordering uses contract publish transaction time. The raw rendered organizer paragraph combines “midnight”, “11:11:11”, “November 21st” and “one week after the launch”; this is not strikethrough formatting. The Lobby deliberately leaves `closesAt` null and labels the cutoff unconfirmed. Replace it only after organizer clarification, not date arithmetic.
- [Launch Creator Contest, topic 503](https://community.tari.com/t/ootle-launch-event-creator-contest/503): closes November 12 at 00:00 UTC; top ten by points receive 100K XTM each. The October 31 edited original and organizer clarification in post 7 govern blog eligibility. Point tiers are 30 / 15 / 10 / 3 for long YouTube / Shorts / long articles / Bluesky. Cross-posts must be adapted; X alone has no points.

`novemberContests.ts` owns the public briefs and date boundaries. `/challenges/november-mvp`, `/challenges/first-to-launch` and `/challenges/launch-creator` link directly to their respective official entry threads. The home page leads with these contests and retains the October gallery and old detail URLs as archive material. The creator and bonus contests use the forum directly; they do not ask entrants for an unrelated repository through the project intake form.

The MVP brief also links to `/submit?contest=november`. This requests a reviewed Lobby listing after the forum entry is posted. Shared `listingContests.mjs` ties intake and reviewer labels to the correct topic; a November listing cannot use an October, bonus or creator-contest reply. No database migration, provider, automated post, prize settlement or outbound message is introduced.

## Resource selection receipt

Reused the installed React/router website, approved Customer.io-derived turtle-and-ghost builder scene and optimized image delivery, Tari typography/palette, existing contest route, and tested private PostgreSQL intake with PGlite verification. The existing October-only cards and destination checks could not represent three different contests or November topic 520; the change adds one small data model and an explicit intake destination instead of a new publishing pipeline. The representative trial exercises topic validation, a durable November receipt and readback through the real public router. Responsive browser checks cover the actual built app before publication. October content records, community event/calendar configuration and newsletter controls are preserved.

Checks: focused contest route/date tests, intake validation and persistence tests, full repository tests/validation, production build, then live desktop/mobile routes and revision verification. The final PR records the exact results and deployment boundary.


## Submission galleries

The homepage now puts **November submissions** directly after the contest cards. Linked controls reveal MVP builds, First to Launch and Creator posts; each contest brief links directly to its own view. Creator posts are no longer nested in the closed October gallery. Existing `/#creator-submissions` links still open that view, with newest creators first.

Reviewed MVP records belong in `content/submissions/november-2026/`; launch records belong in `content/submissions/first-to-launch-2026/`. Their metadata lives in the matching `content/contests/` files. Both use the existing validated content feed, shared project cards and collapse control. Validation rejects duplicate identities/posts and submissions linked to the wrong contest thread. Preserve an entry's slug when updating it. Creator entries remain in `content/creator-submissions/launch-2026.json` and retain their individual forum-post identity. Publication uses the existing reviewed PR/build/deployment workflow; a private listing request is not public and does not claim contest eligibility.

November 2 check: the complete public streams for topics 520 and 521 each contained the organizer's first post and an empty moderator action, with no entries. Topic 503 contained 16 posts; added Habib Ayomide's post 16 (Medium and Reddit links), bringing the creator registry to 11 people, including Sam's announcement awaiting publication links. No winners or launch rankings are inferred.

Reuse receipt: existing React/router, `ProjectCard`, reviewed content validation/feed, creator registry and Tari styles. A representative trial loaded all three build registries and preserved all 28 October entries before the site build. The only registry gap was October-only identity/path validation; extending that allowlist provides distinct future population paths without a new service or dependency. Reused identical-lockfile installed dependencies from the maintenance checkout in Developer; builds and QA stay outside Drive roots.
