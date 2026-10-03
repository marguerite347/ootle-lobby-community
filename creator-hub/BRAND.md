# Ootle Lobby

Product identity · 2026-09-23

**This might go hard.**

Build it. Break it. Let your friends find out.

A creative playground for games, wild experiments and Riffs, built with the Tari community. People and their agents find a foundation, learn the moves, build a playable idea and give the next creator something to riff on.

## Name and positioning

Use **Ootle Lobby** on first mention; **the Lobby** in conversational copy. Use **built on Tari** as the ecosystem endorsement, not a claim that every project executes on-chain. Creator Hub and Ootle Creator Jam are former names. Creator Jam may label an actual challenge or event, not the whole product. Keep existing repository paths, package names, storage keys, project IDs and historical creator credits compatible. Do not rewrite archived media or third-party skill titles merely to rename the product.

The Lobby is an ongoing creative playground; individual time-limited challenges have explicit dates. It is not only a scheduled game jam.

## Voice

A playful host who hands you the controls. Confident, mischievous, welcoming and concrete. Give creators the spotlight. Invite a surprising action rather than telling people the platform is revolutionary.

The user's Savannah Bananas reference informs participation and showmanship. Their [official site](https://thesavannahbananas.com/) presents entertainment as the entry point. Our interpretation is to make creating feel like joining the show. Do not copy their marks, characters, slogans or imply affiliation.

“Turn it up to 11” means a memorable payoff with a readable setup. Use excitement where something actually happens, not constant shouting, flashing or vague promises. Respect reduced motion and effects-off settings. Audio remains opt-in.

Avoid generic campaign leads such as “Make something,” “Unleash your creativity,” “Endless possibilities” and “Build your next world.” The user explicitly rejected “Make something” as generic. Keep functional labels like Create, Publish and Download clear.

Do not use “weird” in current product or campaign copy. The owner struck this language from the approved update copy; do not reintroduce it in headlines, community invitations or empty states.

## Approved copy palette

User-approved direction: gaming group chat, clean language, playful confidence and earned surprise. This is a voice reference, not an age restriction or a claim about every teenager. Do not imitate a particular game or force trending slang into every sentence. One expressive line per moment; the next line explains the action plainly. Avoid repeating the same catchphrase across nearby sections.

| Moment | Approved direction |
| --- | --- |
| Brand headline | This might go hard. |
| Supporting promise | Build it. Break it. Let your friends find out. |
| Create invitation | Wait. Let me cook. |
| Riff invitation | Okay but what if… |
| Challenge invitation | Chat, can you build this? |
| Publish invitation | Send it. |
| Successful publish | You cooked. Now let them play. |
| Learn invitation | Figure it out. Then go off. |
| Daily Spark | Lock in. Get your loot. |
| Daily Spark supporting line | Beat the question. Spin for the multiplier. |
| Small settled win | Loot secured. |
| Super Spin unlocked | Wait… bonus round? |
| Large multiplier | RNG went crazy. |
| Highest reward reveal | NO SHOT. |
| Launch | 11/11. 11:11. It’s about to get loud. |

Keep navigation labels Lobby Games, Discover, Learn, Skills, Challenges, Create and Projects literal. Lobby Games (`/games`) lists published releases that have a Play link. Expressive CTAs need clear adjacent explanations: “Send it” accompanies “Publish your project”; do not make people decode a destructive action, price, permissions request or error. Explain RNG as chance in help text.

No profanity, censored profanity, slurs, humiliation or “Actually illegal.” The user rejected “Big brain. Bigger loot,” repetitive “go off,” “Know it. Hit it. Spin it,” and “Surely this is the god run.” Do not recycle these as defaults. FAFO is internal shorthand for curious experimentation, not public copy. “Legendary drop” signals a possible exceptional outcome, never a guaranteed result; show ordinary outcomes honestly and keep odds/reward rules accessible.

Use error and success examples only when the underlying state supports them. Never claim a retained draft, published release, prize, token reward or network availability without evidence. Sparks and native TARI remain distinct.

## October 2026 campaign copy

Preserve the reviewed October update’s distinctive language in seasonal surfaces:
“Create a confidential concoction” for the Spooky Secrets invitation;
“The Ootlejuice sidequest” for the bonus Security Bug Hunt;
“Brew something brilliant” for the creator/community invitation.
The build contest stays primary and the Security Bug Hunt is the bonus contest.
These lines were verified against Customer.io broadcast 534 / template 812 on
2026-10-03. The owner’s exclusion of “weird” takes precedence over any older
source or preview preheader. Do not restore that wording.

## Visual identity

**The design system is the visual and UI standard:** [`design-system/`](design-system/README.md) holds the tokens (`tokens.json`, `tokens.css`), type scale, component guidelines, marks and art direction extracted from the shipped app, with a live browsable version linked from its README. This guide owns naming and voice; the design system owns how things look. New pages, games, videos, covers and agent-built UI use its tokens by name instead of new hex values, and `node creator-hub/design-system/scripts/tokens.mjs` must pass after any token change.

Reuse the public Tari brand tokens already recorded in `video-templates/src/brand.mjs`: ink `#040723`, cloud `#ECEEFF`, purple `#813BF5`, electric green `#C9EB00`. Lavender remains the quieter UI accent. Keep existing Poppins typography; do not bundle licensed Druk without entitlement.

The original Jam mark uses two rising strokes reading **11**, with an offbeat spark. It is a product emblem, not a replacement for the official Tari logo. Source: `hub/client/public/ootle-jam-mark.svg`. Pair it with a stacked Ootle / Lobby wordmark; use the full accessible product name on the home link.

Art direction: a midnight creative arcade, bold scale, cutout tickets, unexpected game objects, electric accents and celebratory reveals. Let real creator work provide the variety. Avoid replacing bespoke game covers with generic brand gradients. Layouts need breathing room and readable controls before spectacle.

## Adoption and ownership

Shared navigation, homepage introduction, document title/favicon, footer and current product references use the new name. Historical documents and project titles may still say Creator Hub. New work follows this guide.

Grok owns the current Daily Spark design and implementation. Codex may steer, critique and supply resources. The Producer coordinates routine decisions and iteration without waiting for Codex at each step; review before merge remains required. Batch brand feedback at a safe checkpoint rather than interrupting every specialist.

## Resource selection receipt

Reused existing Tari palette/Poppins, app shell, homepage layout and resource-first/copywriting/readable-code guidance. No new animation package or paid asset generation is needed for this identity pass. Validate with the existing client build and inspect the shared header and homepage at desktop/mobile widths. Local preview is not production deployment.

## Visual application: loot culture, Tari craft

- Build focal art around a distinctive collectible or playable object: dimensional lighting, tactile silhouettes, foil-like edges and a crisp impact frame. Reuse Tari ink/purple/lime/Poppins; do not copy Fortnite UI, characters or branded assets.
- Use clear rarity tiers through shape, label and composition as well as color. Routine rewards get a tight spark and satisfying settle; a real bonus unlock gets a new scene beat; the top outcome earns the strongest burst and “NO SHOT.” Never render every outcome like the jackpot.
- Give buttons a brief press/compression and release response. Keep text still and readable. Reward motion should move from anticipation to reveal to balance credit, then settle; no permanent confetti, flicker or particle fog over controls.
- Let the main art dominate one area with an expressive headline beside it. Keep instructions, odds, counts and navigation quiet. Avoid repeating neon-bordered rectangles as a substitute for composition.
- Mobile touch, keyboard focus, effects off, reduced motion and muted audio must preserve the complete meaning. Audio is opt-in; reveals are skippable without changing rewards.

## Rollout and acceptance

This guide supersedes earlier voice suggestions for new UI, marketing and agent work. Historical credits and published artifacts remain historical. Update active entry points deliberately rather than replacing every string mechanically. Check each line in its real page and game state, at desktop/mobile sizes and with motion off. Confirm claims against server results. A brand guide update is not evidence that the deployed UI has changed.

Selection receipt: reuse existing Tari tokens, bespoke assets, copywriting and resource-first workflows; no new paid generation or dependency required for the guide. The approved copy table is the small representative writing sample. Grok owns visual execution and reports actual screenshots/playback separately.

## Lobby language and product architecture

Approved identity, as a complete lockup:

**Ootle Lobby**

**This might go hard.**

*Build it. Break it. Let your friends find out.*

Ootle Lobby is the platform and community home base. **Creator Jam** is the name for challenges and events inside it, not a second name for the whole product.

| Expression | Use and clear meaning |
| --- | --- |
| Enter the lobby | Welcome/home entry CTA; takes people into Ootle Lobby. |
| Fresh drops | Newly published games, Riffs or resources; use actual publication recency, not arbitrary featured items. |
| Your loadout | The selected skills, assets, tools and starter for a creator project; keep setup/access requirements explicit. |
| Find your squad | Find creators or collaborators; link to a real community destination. Do not imply matchmaking or chat exists if it does not. |
| Creator Jam | Weekly challenges and organized events; include the actual brief, dates and entry action. |

Use these as contextual headings and invitations. Keep primary navigation and functional labels understandable; pair playful headings with plain explanations. These approved names do not themselves implement a loadout store, matchmaking or new social features.

## Active interface copy pass — 2026-09-23

The launch feature and waitlist heading now use “It’s about to get loud.” with “11/11. 11:11 UTC. You in?” Keep the planned date and service-availability caveat factual. Retire “We’re turning it up to 11” from active campaign copy.

Applied the voice across homepage invitations, Discover, Learn, Skills, Create, Studio, assets, game toolkit, challenges, journal, signup invitation, onboarding, search, project shelves, feedback and learning prompts. Retain clear navigation, configuration, permissions, errors, dates, pricing and actual reward conditions. User project titles, imported resource descriptions and existing article bodies are authored content, not text to overwrite globally. Daily Spark state copy is owned by the ongoing Grok PR; integrate its approved voice with this pass before calling the preview complete.

Copywriting/resource-first receipt: reused existing UI strings and brand palette, no new package or generated art. Checked the countdown as a representative sample, scanned route/component headings and removed stale campaign slogans. Production compilation checks syntax; desktop/mobile visual acceptance and the game branch integration are separate checks.

## Riff product naming

A **Riff** is a creator’s own take on an existing game or project. Use **Riff** (singular), **Riffs** (plural), **Create a Riff**, **Play this Riff**, and **Community Riffs** in product copy. Example: “Check out my Riff on [game title].” Describe the process as remixing components when helpful; the resulting product is a Riff. Avoid “remix” as the product noun and “Riff’s” as a plural.

Keep existing `remix` API routes, storage fields, event names, asset paths, filenames and saved project identifiers compatible. They are legacy technical names, not the product vocabulary. Do not rename user-authored project titles or rewrite third-party licenses and historical source quotations. Update current UI, default generated names, agent instructions and editorial copy together.
