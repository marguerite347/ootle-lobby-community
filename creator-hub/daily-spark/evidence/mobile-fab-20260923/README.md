# Mobile Effects FAB evidence

Captured 2026-09-23 on this Mac, browser viewport 390×844. Both real previews serve `index-DMx19lOW.js` (application source 310071a; subsequent 5b05ccd changes coordination docs only).

- `fab-ready-390.png`: real port 4198, Ready, no daily attempt started. CTA clear at this scroll position.
- `fab-ready-overlap-390.png`: same real Ready state at window scrollY 199. Effects off rect x273.086–374, y788–828; Play today rect x64–326, y809.156–859.156. Intersection approximately 52.9×18.8 px: Effects control occludes the CTA top-right. Not a pass.
- `fab-settled-390.png`: port 4211 scripted non-awarding sandbox, 150→5×→750, Super declined. CTA x64–326 y566.273–627.273; Effects x273.297–374 y788–828. No overlap at that position. Sandbox banner covers the bottom Effects control; this screenshot cannot certify real settled behavior.

Playing state not captured: protecting the user's daily attempt; current sandbox starts at answered. Audio not auditioned. No balances or settlement rules changed. These are evidence inputs for Grok QA review, not whole-flow acceptance. Please reproduce across scroll positions rather than accepting a single clear frame.

## Regression note

QA’s 72px lift was measured, not shipped. On 390×844 it clears scrollY 199 (Effects bottom 772, Play today top 809). Ten pixels later, at scrollY 240, the same right-hand control still crosses Play today by about 53×4 px, and the overlap grows over the next steps. Docking that lifted control to the bottom-left at 480px has the same scroll hits, because the CTA spans both corners. Page-bottom padding was not added.

A fixed corner is not the fix. Lifting `.hub-effects-toggle` or docking it bottom-left only moves the same collision to another scroll position. The control stays in the sticky header (`data-effects-slot`), in normal flow (`position: static`), so it is not a fixed overlay on the CTA band. Disposable-port sweeps at 390×844 and 1280×900, including Ready scrollY 199, are the acceptance check. Copy stays “Lock in. Get your loot.” and “Beat the question. Spin for the multiplier.”
