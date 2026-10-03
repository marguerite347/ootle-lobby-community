# Interactive weekly challenge

The homepage shelf and `/challenges` share `client/src/components/ChallengeStory.tsx`.

The illustration demonstrates action → result with a repeatable spark interaction. Three selectable steps explain building a satisfying interaction, publishing a playable project and demo, and submitting evidence for community review. The example's local spark count is intentionally separate from API-backed submitted/verified totals. It never submits data or advances the community goal.

The component retains the edition brief, dates, success evidence, submission link and pilot funding status. Keyboard controls, live status text, focus outlines and reduced-motion styling support accessible use. The layout stacks on narrow screens.

Validation: production TypeScript/Vite build and 40 existing client tests pass. Browser checks confirmed the spark result, step selection, unchanged zero-of-five community progress, and layouts at 390px and 1280px. Local preview only; not deployed.
