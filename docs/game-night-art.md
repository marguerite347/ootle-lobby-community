# Game night banner artwork

The banner reuses the lime Tari turtle identity from the November 1 game-night artwork shipped in the October newsletter. A separate transparent gamer illustration fits the compact banner without repeating the newsletter's embedded event text.

- Generator: built-in imagegen, with the shipped newsletter artwork as the character/style reference.
- Asset: [game-night-gamer.webp](../creator-hub/hub/client/public/community/game-night-gamer.webp), 512 × 512, 47,642 bytes, preserved alpha.
- Packaging: existing cwebp executable, quality 86, resized to 512 × 512. No new runtime dependency.
- Trial: inspected the reference and generated image, then the actual packaged website at 1440, 390 and 320 pixels. No horizontal overflow at either phone width.
- Layout: mascot beside the title on phones and to the left of event details on desktop. The dismissal control remains separate and the Discord CTA has no arrow.

## Generation prompt

Use case: stylized-concept. Asset type: compact gamer illustration for the Tari community game night website banner on a dark purple background. Input image 1 is a character/style reference from the shipped Tari newsletter: reuse the lime-green Tari turtle mascot's face, large black/white eyes, spotted head, yellow belly and teal shell, not the text or scene. Create a polished 3D-rendered illustration of ONE matching cute Tari turtle gamer wearing oversized purple gaming headphones and a backward purple cap, seated with knees up, eagerly gripping a charcoal game controller with small lime buttons; delighted and a little spooked expression for a co-op horror game night. Clear front three-quarter view, strong readable silhouette at small size, entire mascot and controller fully visible, tightly framed with a little breathing room. Rich smooth vinyl/toy materials, purple rim light, lime highlights. Genuine transparent background, no backdrop, no ground plane, no text, no typography, no arrows, no logos, no frame. The character must feel like the same Tari mascot in the supplied image. Output a square image.
