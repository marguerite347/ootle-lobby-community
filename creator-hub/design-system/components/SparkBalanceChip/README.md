# SparkBalanceChip

Header pill showing the viewer's Spark balance, linking to the Daily Spark on the home page.

Static rendition from the app's own classes; the consumer supplies real data and the behaviour lives in the React component named below. Source: `SparkBalance()` in `components/DailyTrivia.tsx`, styles in `DailyTrivia.css`. It takes no props; the balance comes from `TriviaProvider` (shows `—` while unknown).

- Lime-on-olive pill (`#202317`, border `#d5f54455`, text `#e6ff86`), ✦ glyph with a lime glow, 20px balance.
- The number pulses once (`spark-bank`, .5s) each time the balance changes; off under reduced motion and effects off.
- Its `title` must keep saying Sparks are free Hub points with no cash value. Sparks are never TARI.
