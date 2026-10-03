# Trivia sequence v2

User-approved direction: build the trivia sequence first, including a complete successful question/wheel loop, a quick variety montage and at least one loss. The full creator-story reel remains pending storyboard review.

Target sequence: 25 seconds. First capture/edit is a silent timing study, not the scored creative proof. The scored 10–15 second proof follows once a licensed score has been selected and tested.

- 0–4: real core-loop question and correct answer. Caption: Lock in.
- 4–9: bonus wheel spin and 5× landing. Caption: Get your loot.
- 9–15: optional Super Spin, jackpot and settled 7,500 AI Sparks. Explain 150 × 5 × 10, credited in increments by the real state machine.
- 15–18: sprite-sheet question. Caption: Across a few days · Art.
- 18–21: version-control question. Caption: Across a few days · Building.
- 21–25: playtesting question, wrong answer, correct explanation and next-day lockout. Caption: Missed it? Learn it. Back tomorrow.

Source truth: one attempt per UTC day, 20-second answer deadline, 150 base within 8 seconds or 100 afterward. Correct answer grants the base. Stage spin credits only the difference. A 5× result offers optional Super; the 50× total path has 0.5% probability. Wrong answers award zero, with no same-day retry. Montage days are explicitly simulated and labeled. The two teaser questions do not award credits, leaving the final balance at 7,500. Day transitions must never imply multiple daily attempts exist.

Use the real React UI and createDailyTrivia state machine in a separate localhost capture proxy. Deterministic random draws and a simulated clock apply only there. AI Sparks is explicitly labeled as concept wording. No live chat, wallet or reward writes. Raw recordings remain outside Git. Reuse Playwright capture and editable Remotion composition; cuts shorten holds but must not reverse the causal order or hide the loss consequence.
