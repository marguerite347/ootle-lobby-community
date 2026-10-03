# Council monthly contests

The homepage places the monthly contest panel directly below the weekly challenge/creator area. The Challenges page repeats the same component. Forum navigation is also in the shared footer.

Sources checked September 22, 2026:
- Rules and prizes: https://community.tari.com/t/ootle-launch-date-and-launch-contest-rules/323
- September theme and official submission thread: https://community.tari.com/t/september-contest-thread/324

`client/src/monthlyContest.ts` is the reviewed edition configuration. The September edition closes October 1, 2026 at 00:00 UTC. After that boundary, the UI marks it closed, hides the entry form and directs people to the forum. It must not fabricate a new theme, deadline or submission thread. To add the next edition, verify the Council announcement and update configuration, labels and tests together. This is a dated curated snapshot, not an automatic forum synchronization service.

The shared MonthlyContest component summarizes eligibility, announced XTM prizes and required entry fields. It is separate from the weekly pilot rewards. Monthly contest licensing requirements reflect the Council rules; they are not a new restriction on the general Ootle Lobby library.

The entry helper creates a social announcement and forum-reply draft. It does not publish externally, connect a wallet, validate an address, store payment addresses or create a contest submission in the Hub. The creator posts a public announcement and submits by replying to the official Council thread. Local/private-network URLs are rejected as public links; a reachable URL is not proof that its contents are publicly accessible. Browser refresh clears the draft.

Validation: UTC deadline boundary and draft-field tests; production build; browser entry preparation and localhost rejection; 1440px/390px visual checks with no clipped prize values or horizontal overflow. Source and implementation history are preserved in Git.

## Imported September entries

Eight existing submissions now have canonical project profiles and attributed creator portfolios. See [September contest profile coverage and maintenance](../SEPTEMBER_CONTEST_PROFILES.md) for source coverage, submission checks, capture evidence and the distinction between imported attribution and claimed accounts. The curated registry is versioned in `data/contests/september-2026.json`; it is not automatically refreshed or a Council eligibility ruling.

## Progressive disclosure

Keep the contest title, prizes, deadline, forum submission and entry browsing visible. Eligibility, judging, required fields, source links and payout context live in the collapsed-by-default “Contest details & entry requirements” native disclosure. The preparation form remains a separate disclosure. Both support keyboard activation and visible focus. This shared layout applies on Home and Challenges; hiding details does not remove or change the rules.
