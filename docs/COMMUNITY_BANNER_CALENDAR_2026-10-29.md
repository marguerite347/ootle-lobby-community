# Shared community banner and calendar

The lobby now places game night and the Tari Show together in the existing dismissible banner. The approved turtle remains; a headphone ghost from the earlier “Don't Ghost the Tari Show” campaign accompanies the show. There is one Discord invitation and one shared calendar action, with no decorative arrows.

## Selection receipt

Reused the current React banner, its Tari colors and Poppins typography, existing game-night configuration, native HTML dialog, and public Express entry point. Read the resource-first, redesign and imagegen skills. No calendar SDK, OAuth account access, paid service or new runtime dependency is needed. A read-only iCalendar feed fills the missing multi-event calendar capability. The first trial was the actual built page at 1007 and 390 pixels plus a browser download of the generated calendar.

The new ghost was extracted with built-in imagegen from the existing October “Don't Ghost the Tari Show” headphone-ghost card. The original campaign card contains obsolete embedded scheduling text; only the character is reused. The shipped asset is [tari-show-ghost.webp](../creator-hub/hub/client/public/community/tari-show-ghost.webp), packaged with the already installed cwebp at quality 86 and 512 pixels wide, preserving transparency (41,298 bytes).

Prompt: “Use case: background-extraction. Edit target: the provided Don't Ghost the Tari Show campaign card. Extract ONLY its cute white smiling ghost wearing the purple and lime headphones, preserving the same character, face, pose, soft 3D shading and headphone colors. Full body centered, generously fills square canvas. Genuine transparent background. Remove ALL text, logo, button, bat, corner marks, smoke, scenery and background. No new objects, no lettering, no arrows. Keep the exact friendly waving ghost identity from the reference. This is a small transparent character asset for the Tari website alongside an existing scared turtle.”

## Schedule evidence

- Game night: the October 27 [Discord announcement](https://discord.com/channels/892738558316662855/893157378789351475/1564658377647464551) confirms November 1 at 6 PM ET, R.E.P.O. or Shift At Midnight, and Game Streams voice. That is 23:00 UTC after the November 1 daylight-saving transition. No end time is announced; banner expiry is deliberately not used as an event end.
- Tari Show: the organizer's existing calendar was read on October 29 and confirms November 3, 1–2 PM America/New_York (18:00–19:00 UTC). The October 27 1:01 PM post in the public Tari announcements channel confirms the Stage venue. No private event identifiers, contacts or calendar data are embedded in the website or feed. Only the upcoming November 3 occurrence is published; no unconfirmed recurrence is generated.

## Calendar behavior

`/community/events.ics` contains both configured events, stable UIDs, UTC starts, escaped text, CRLF/UTF-8-safe folding and 15-minute display alarms. Google and Apple subscription choices use this same feed; the download can be imported into compatible calendars. Each visitor confirms in their chosen calendar. Nothing is silently inserted into accounts, and notifications depend on the calendar's own settings. Subscribed calendar refresh timing is controlled by the provider.

Google's [public-calendar instructions](https://support.google.com/calendar/answer/37100?hl=en) require the web interface for adding subscriptions. Apple's [Calendar guide](https://support.apple.com/guide/calendar/subscribe-to-calendars-icl1022/mac) documents calendar subscription. Event serialization follows [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545). A date-time event without an announced end has no DTEND or invented duration.

When content changes, update the corresponding JSON schedule and the event sequence/timestamp. Update each event rather than reusing its UID for a different session. The banner hides each event independently after its configured expiry, so the Tari Show remains after game night ends. Dismissal is tied to both schedules; a changed session can appear again.

## Validation

- Production client build and packaged runtime check.
- Eight server tests: calendar format, distinct stable events, DST, escaping, UTF-8 folding, disabled/unconfirmed events, public MIME/download route, plus newsletter and retired-page regression coverage.
- Seven client tests: countdown, game-night lifecycle and independent shared-banner expiry.
- Content validation and integration-gap registry checks.
- Rendered desktop and phone layout, calendar dialog and downloaded file. Production provider handoffs are checked after the exact merged revision is deployed; checks do not subscribe the operator's personal calendar.

The production Google trial confirmed that its `cid` parameter must contain the encoded `webcal://` URL, not HTTPS. The corrected link opens Google's “Add calendar” confirmation with the live feed. This matches the provider integration documented by [OneUptime](https://oneuptime.com/docs/en/on-call/calendar-feeds). The confirmation was cancelled; no operator subscription was created.
