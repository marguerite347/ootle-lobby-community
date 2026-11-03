# November 3 Tari Show time correction

The official public Discord scheduled event `1516878863127281755` was read on November 3 at approximately 03:53 UTC. Its `scheduled_start_time` is `2026-11-03T17:00:00+00:00`, which is noon EST after the November 1 daylight-saving change. The original X announcement pairs “1PM EST” with “17UTC”; use the scheduled event as the primary time source.

Source: https://discord.com/invite/dj34vQSe6d?event=1516878863127281755
Original announcement: https://x.com/tari/status/2117255411959050311

The existing calendar UID is retained and SEQUENCE increases from 0 to 1. The event has no announced end. The one-hour banner display window remains a UI expiry only; the calendar omits DTEND. Calendar provider refresh timing is outside this release. The weekly game-night event is unchanged.

Selection receipt: reuse the existing JSON event, time-zone formatter, calendar serializer and subscription update mechanism. No new scheduling service or calendar identity.
