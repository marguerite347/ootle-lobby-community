# DailySparkCard

The home-page Daily Spark hero: an intro column beside a game card that moves through ready, question, spin and settled states.

Static rendition of `DailyTrivia` in `components/DailyTrivia.tsx` (question state shown). It takes no props and must sit inside `TriviaProvider`; the server supplies the question, options, multipliers and reset time.

- Showcase shell: radius 32px, purple-to-ink gradient, lavender border. Headline in `lobby-display` scale with the second line in lime (`#ecff8e`, soft glow).
- Question: a 40px lime timer and a 4px track; at 5s or less the track turns orange (`#ffb273`) and the timer amber. Answers are 48px-tall lavender tiles with letter badges; the chosen one turns lime-edged olive (`#31401c`).
- Copy is fixed by the brand book: "Lock in. / Get your loot." then "Beat the question. Spin for the multiplier." The hint states the real point rules.
- Under 760px the game card comes first in a single column. All animation is off under reduced motion and effects off.
