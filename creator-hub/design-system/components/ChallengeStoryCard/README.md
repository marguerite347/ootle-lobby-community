# ChallengeStoryCard

Weekly Creator Challenge card: lime banner, mission heading, a tilted "7 DAY" deadline and a community progress meter.

Static rendition of `components/ChallengeStory.tsx` (demo loop omitted). The consumer supplies an `edition` (`number`, `title`, `brief`, dates, `phase`, `target`, `submitted`, `verified`, `rewardStatus`).

- Card on `#14121e`, radius 24px. Banner is solid lime (`#dafa50`) with ink caps and an "Open for submissions" dot.
- Headline at `clamp(36px,5vw,68px)`; the join button is a lime pill. The deadline column is a 100px lime "7" rotated −5deg, beside the real submit-by date and time zone.
- The meter counts only verified contributions against the target and states awaiting review and prize status plainly ("Pilot goal, no funded prize").
