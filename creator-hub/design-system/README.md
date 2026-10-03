# Ootle Lobby Design System

The single visual and UI standard for Ootle Lobby: tokens, type, components, marks and art direction, extracted from the shipped app. Any page, game, video, cover or agent that shows Ootle Lobby follows it, alongside [BRAND.md](../BRAND.md) for voice and [TERMINOLOGY.md](../TERMINOLOGY.md) for names.

- **Live, browsable version:** [Ootle Lobby Design System](https://claude.ai/artifact/WmbbLz3jt6zbZTpNY2oBcA) (component previews, token tables, themes). This folder is its source of truth in the repo.
- **Where it came from:** `creator-hub/hub/client` at main@7ee5c97 (see `tokens.json` → `meta`), plus later reviewed changes.

## What is here

| Path | Use it for |
| --- | --- |
| [`tokens.json`](tokens.json) | Every colour, type style, spacing, radius and shadow token, with a usage note. Two themes: **Midnight** (the app) and **High contrast** (accessibility). |
| [`tokens.css`](tokens.css) | The same tokens as CSS custom properties, plus the Poppins `@font-face` rules. Generated; do not edit. |
| [`components/`](components) | One guideline (`README.md`) and a static preview (`preview.html`) per component. |
| [`components/bundle.css`](components/bundle.css) | The app's compiled stylesheet the previews render with. |
| [`fonts/`](fonts) | Poppins 400/600/800 (latin). |
| [`assets/`](assets) | Guidelines for the Jam mark and the Daily Spark art. The files themselves stay canonical in `creator-hub/hub/client/public/` (`ootle-jam-mark.svg`, `daily-spark/`). |
| `design-system.json` | The artifact's index, kept so the live version can be re-synced from this folder. |

## Crystal color loadouts

[Three-color crystal loadouts](CRYSTAL_COLOR_LOADOUTS.md) define six choices with separate edge-shadow, facet and inner-glow colors, plus material contrast and review guidance. Use the shared palette module linked there for crystal renders and capture work. These art palettes do not replace global UI tokens.

## Reward wheel palette

[Reward journey and approved Dark Energy Super palette](REWARD_JOURNEY.md#approved-dark-energy-super-palette) specifies the accepted near-black ordinary wedges and violet, hot pink, cyan and lime multiplier wedges. Use this mapping for Super wheel builds and captures; the crystal palette remains independently randomized.

## Accepted motion and asset workflow

- [AI Spark crystal and sparkle orbit](components/AISparkCrystal/README.md): user-accepted September 24 treatment, with exact source, geometry, lighting and tail-fade guidance. Accepted isolated proof; product integration remains pending.
- [Finding and integrating creative assets](ASSET_INTEGRATION.md): select finished visuals, verify licensing and formats, preserve their character, and inspect full-loop evidence.
- The external browsable artifact and static asset index have not been re-synced for this motion treatment. The linked repository guidance is authoritative; old static crystal plates are not the accepted motion reference.

## Using it

- **In the Hub client**, the tokens are already the `:root` variables in `creator-hub/hub/client/src/styles.css`. Reuse them by name (`var(--accent)`, `var(--radius)`) instead of new hex values.
- **In a game, example, video template or standalone page**, link `tokens.css` (it loads the fonts from `fonts/`) and use the same variable names. Set `data-theme="high-contrast"` on `<html>` for the accessibility theme.
- **For a new component**, match the nearest guideline in `components/` first; add a new entry only when nothing fits.
- **Agents** read this README first, then the guideline for the component they touch.

## Keeping it in step

The app and the design system must not drift. After changing a token in either place, run from the repo root:

```bash
node creator-hub/design-system/scripts/tokens.mjs --write   # regenerate tokens.css from tokens.json
node creator-hub/design-system/scripts/tokens.mjs           # check: exits 1 if tokens.css is stale or an app :root value disagrees
```

Change `tokens.json` and the app in the same PR, then re-sync the live artifact from this folder. Visual changes still need a rendered check at desktop and 390px width.

## Components

| Component | What it is |
| --- | --- |
| [AISparkCrystal](components/AISparkCrystal/README.md) | Accepted 3D AI Spark crystal with licensed sparkle orbit, synchronized illumination and soft tail dissolve. |
| [Badge](components/Badge/README.md) | Small pill label for ecosystem, readiness, verification and freshness (`.badge`), with a flat `.tag` for keywords. |
| [Button](components/Button/README.md) | Pill-shaped action (`.btn`); `primary` is the lavender gradient for the one thing a view is for. |
| [Card](components/Card/README.md) | Resource card (`.card`): raised `bg-elev` surface with badges, title, clamped summary and a meta footer. |
| [ChallengeStoryCard](components/ChallengeStoryCard/README.md) | Weekly Creator Challenge card: lime banner, mission heading, a tilted "7 DAY" deadline and a community progress meter. |
| [CollectiveChatMessage](components/CollectiveChatMessage/README.md) | Message card in the Collective Chat project room, with role and status chips and an optional artifact link. |
| [ContestPodium](components/ContestPodium/README.md) | Council monthly contest block: heading, entry status pill and a 1st/2nd/3rd prize podium. |
| [CreatorArena](components/CreatorArena/README.md) | Community download leaderboard: a champion card over a ranked roster, with a week/all-time toggle and a join action. |
| [DailySparkCard](components/DailySparkCard/README.md) | The home-page Daily Spark hero: an intro column beside a game card that moves through ready, question, spin and settled states. |
| [DimBar](components/DimBar/README.md) | Labelled horizontal bar (`.dimbar`) for popularity breakdowns — label, track and value. |
| [Facet](components/Facet/README.md) | Filter sidebar (`.filters`) of facet buttons with counts, used beside results in `.with-side` layouts. |
| [Field](components/Field/README.md) | Text inputs: the pill `.searchbar` for hero search and `.field` inputs, textareas and selects with a `.lbl` label. |
| [GameKitPrimitives](components/GameKitPrimitives/README.md) | Small game-UI primitives from the Game UI Kit: a four-step creator path, a quest progress meter and a confirmed-success notice. |
| [JournalCard](components/JournalCard/README.md) | Creator Journal article card with inline SVG art on top; the first card in the grid is the wide featured one. |
| [JourneyCard](components/JourneyCard/README.md) | Collectible portal card (`.journey`) for the main creator journeys — Discover, Learn, Build, Riff. |
| [LaunchTicket](components/LaunchTicket/README.md) | Live countdown chip in the header for the Ootle mainnet launch (11.11 · 11:11 UTC), linking to the waitlist. |
| [MediaCard](components/MediaCard/README.md) | Game-like tile (`.mcard`) with a 16:9 media area on top and a compact body, used in reels and starter grids. |
| [Milestone](components/Milestone/README.md) | Celebration toast (`.hub-milestone`) for a real creator milestone — first publish, first Riff. |
| [Notice](components/Notice/README.md) | Inline message block (`.notice`) on `accent-dim`, and the `.provenance` note that credits a source. |
| [PopularityChip](components/PopularityChip/README.md) | Compact popularity indicator (`.pop`) — tier colour, score and the strongest native metric — that links to the popularity explainer. |
| [RemixInvitationCard](components/RemixInvitationCard/README.md) | Portal-style link card inviting people to explore originals and their Riffs, over an isometric "original vs Riff" illustration. |
| [SiteHeader](components/SiteHeader/README.md) | Sticky shell header: the Jam mark and stacked Ootle / Lobby wordmark, the literal primary nav with hint lines, and quick search. |
| [SkillTile](components/SkillTile/README.md) | Skill Market card for an agent skill or workflow bundle; expands in place into setup and download details. |
| [SparkBalanceChip](components/SparkBalanceChip/README.md) | Header pill showing the viewer's Spark balance, linking to the Daily Spark on the home page. |
| [SparkRewardReveal](components/SparkRewardReveal/README.md) | The settled result: a BASE × MULTIPLIER = BANKED ledger, plus the tiered celebration overlay that plays over it. |
| [Spinner](components/Spinner/README.md) | Loading indicators: the `.spinner` ring and the route-level `.route-loading` gem. |
| [StarButton](components/StarButton/README.md) | Toggle for starring a resource or project (`.starbtn`), showing the current count. |
| [Steps](components/Steps/README.md) | Numbered steps list (`ol.steps`) with lavender counter discs. |
| [Toast](components/Toast/README.md) | Short floating confirmation (`.toast`), bottom-centre pill on `bg-elev-2` with `shadow`. |
| [VaultSpinner](components/VaultSpinner/README.md) | The one-spin multiplier disc shown after a correct answer, with a payout preview and the spin button. |

# Brand book

Ootle Lobby is a creative playground for games, wild experiments and Riffs, built with the Tari community. The interface is a **midnight creative arcade**: deep ink grounds, lavender UI, electric Tari green for the moments that pay off, and bold Poppins. Everything here is dark: there is no light theme. **Midnight** is the brand's own theme, with values exact from the app. **High contrast** is an added accessibility theme.

## Content fundamentals

**Voice: a playful host who hands you the controls.** Confident, mischievous, welcoming, concrete. Give creators the spotlight; invite a surprising action instead of calling the platform revolutionary.

- **One expressive line per moment, then a plain one.** "Wait. Let me cook." sits above "Start a build". "Send it" always accompanies "Publish your project".
- **Navigation stays literal**: Discover, Learn, Skills, Challenges, Create, Projects. Functional labels (Create, Publish, Download) stay clear. Never make people decode a destructive action, price, permission request or error.
- **Sentence case** for headings and buttons; UPPERCASE only for `eyebrow` kickers (letter-spaced .12–.16em).
- **Name the product** "Ootle Lobby" on first mention, "the Lobby" after. "Built on Tari" is an endorsement, not a claim that everything runs on-chain. "Creator Jam" names a challenge or event, never the whole product. The token is **TARI**; Sparks are a separate in-app currency.
- **Approved lines** (use each once per area, do not stack them):

| Moment | Line |
| --- | --- |
| Brand headline | This might go hard. |
| Supporting promise | Build it. Break it. Let your friends find out. |
| Create | Wait. Let me cook. |
| Riff | Okay but what if… |
| Challenge | Chat, can you build this? |
| Publish | Send it. → success: You cooked. Now let them play. |
| Learn | Figure it out. Then go off. |
| Daily Spark | Lock in. Get your loot. |
| Rewards, rising | Loot secured. · Wait… bonus round? · RNG went crazy. · NO SHOT. |
| Launch | 11/11. 11:11. It's about to get loud. |

- **Contextual headings**: Enter the lobby, Fresh drops (real publication recency), Your loadout, Find your squad (only to a real community destination), Creator Jam.
- **Never**: "Make something", "Unleash your creativity", "Endless possibilities", "Build your next world", profanity (censored or not), humiliation, "Big brain. Bigger loot", "Surely this is the god run". Never claim a saved draft, prize, reward or network availability the state does not prove. Explain RNG as chance in help text.
- **Emoji**: not in headings. Glyphs such as ◈ ▶ ✦ ▲ ★ ☆ are used as small typographic marks in chips and placeholders.

## Visual foundations

**Color.** Ground every page in `page` with a faint purple radial glow (tari-purple at ~9% alpha, top-left). Raise content on `bg-elev`, nest controls on `bg-elev-2`, outline with `border` (hairline) and `border-strong` (controls). Set copy in `text`, secondary copy in `muted`, and non-essential metadata only in `faint` (it misses 4.5:1). `accent` lavender is the everyday UI accent — links, active nav, facets — on `accent-dim` when it needs a ground. Reserve `tari-green` for the one word or number that should land: the highlighted word in a headline, an insight value, a trail link. `tari-purple` is for the mark, glows and large fills, never small text. Status: `native` for Tari-native and healthy, `warn` for stale, `danger` for failed, `gold` for the top popularity tier — each always paired with its word.

**Themes.** Midnight is the default and matches the shipped app exactly, including its three weak pairs: `faint` text, `border-strong` control borders and `tari-purple` as text. High contrast (`data-theme="high-contrast"`) keeps the brand colours (`tari-*`, `focus`, the `-dim` grounds) and raises everything else. Every text colour reaches 7:1 or better on `page`, `bg-elev` and `bg-elev-2`. `border` and `border-strong` reach 3:1 or better, so surfaces separate by outline rather than shade. Offer it wherever effects-off and reduced-motion are offered. Only tokenised colours switch: literal hex values in page stylesheets (for example the active-nav ground `#242034`) stay as they are and need converting to tokens before the app can adopt the theme.

**Type.** Poppins throughout (400, 600, 800), via `--font-sans`. Headlines are heavy (800) and tight: `lobby-display` −0.06em, `hero` and headings −0.02em, `text-wrap: balance`. Body is `body` 14/1.5, summaries `summary` 13.5/1.5 in `muted`, ledes `lede` 19/1.55. Kickers use `eyebrow`. Mono (`--font-mono`) only for hashes and ids, in `accent`. Druk is the licensed brand display face and is intentionally not bundled.

**Shape.** Controls are pills (`radius-pill`): buttons, badges, chips, the search bar, toasts. Content surfaces round up with importance: `radius` 14px cards, `radius-portal` 22px journey portals, `radius-feature` 24px release features. Fields and media thumbs use `radius-sm`.

**Spacing and layout.** Content sits in a centred container of `maxw` with `space-gutter` sides. Card grids are 3-up (2-up for wide cards) with `space-grid` gaps, collapsing to one column under 900px. Cards pad `space-card`. Sections breathe with `space-section`. Let one piece of real creator art dominate an area with an expressive headline beside it; keep instructions, odds, counts and navigation quiet.

**Depth.** Surfaces are separated by borders, not shadows. Shadows appear only on lift: `shadow-card-hover`, `shadow-portal-hover`, `shadow-primary(-hover)`, floating layers (`shadow`, `shadow-milestone`). Hover glows are lavender (`lavender-glow` at low alpha), never white.

**Motion.** One easing, `cubic-bezier(.2,.8,.2,1)` (`--hub-ease`), 150–250ms. Buttons compress to `scale(.96)` on press; linked cards and portals lift 4–7px on hover; portals sweep a soft shine. Rewards move anticipation → reveal → credit → settle: a tight spark for routine wins, a new scene beat for a bonus, the strongest burst only for the top outcome. No permanent confetti, flicker or particle fog over controls; body copy stays still. The Daily Spark entry headline is a deliberate exception: “Lock in. Get your loot.” lands once, 2 seconds after mount, with a 220ms phrase stagger, weighted squash/bounce and a short lime impact glow. Reserve its layout space; never move the crystal or CTA. No hover loop or replay on reward state changes. Reduced motion and effects-off show static text immediately. Every effect respects `prefers-reduced-motion` and the `data-hub-effects="off"` switch; Daily Spark audio starts on the first game interaction, with no sound toggle in the current presentation; reveals are skippable without changing results.

**Game surfaces.** Feature components (Daily Spark, Launch Ticket, Creator Arena, Contest Podium, Challenge Story, Game Kit) push harder than the shell: bigger radii (24–32px), deeper purple radials, and lime as the payoff colour. The page stylesheets use five near-identical limes (`#c9eb00`, `#d5f544`, `#dafa50`, `#d4f56e`, `#c4ff38`). For new work use `tari-green` for fills and headline accents and `focus` for rings and live dots, and treat the other three as legacy until they're consolidated. Scale spectacle to the real outcome: the solid lime tile, sunburst and coin rain belong to the top result only (first place, the 5× path, NO SHOT.). Counts, prizes, ranks and rewards shown in these components come only from real data.

**States.** Focus-visible is a 2px solid `focus` outline offset 4px on every interactive element. Hover raises the border to `accent-strong`. Active nav adds an inset 2px underline. Disabled drops to 50% opacity. Touch targets are at least 44px on primary actions.

**Imagery.** Real creator work supplies the variety — bespoke game covers, playable captures, collectible objects with dimensional lighting, foil edges and a crisp impact frame. Do not paper over covers with generic brand gradients. Cutout tickets, unexpected game objects and electric accents are the art direction; loot-culture references stay original (no copied game UI, characters or marks).

## Iconography and marks

- **The Jam mark** (`Logos/ootle-jam-mark.svg`): two rising strokes reading **11** — cloud then green — with an offbeat purple spark, on a tari-ink tile outlined in tari-purple. It is the product emblem, not a replacement for the official Tari logo (which this system does not carry). Pair it with the stacked **Ootle / Lobby** wordmark set in Poppins 800, and give the home link the full accessible name "Ootle Lobby home".
- **No icon font or icon set.** The UI uses Unicode glyphs as small marks (◈ Tari Ootle, ▶ GDevelop, ⛏ Luanti, ✧ Creative, ✦ new, ▲ score, ★/☆ stars, ↗ external) and bespoke inline SVG line art in journey portals. Keep glyphs small, inside chips or placeholders, never as heading decoration.
- **Daily Spark art** (`Daily Spark/`) is the reward art for the vault spinner and sets the bar for game-feel art: dimensional lighting from the top-left, silver/lavender foil edges, lit marquee details, and one lime payoff that the top outcome owns. Tiers read by shape (pips, label size, sunburst) as well as colour. Use these plates only for Daily Spark.

## Reward journey invitation

[Reward journey motion and copy](REWARD_JOURNEY.md) documents the finite three-step
trivia invitation and the question button's lighting sweep, including replay,
reduced-motion and effects-off behavior.

## Riff product language

Use **Riff** for a creator’s take on an existing game or project, and **Riffs** for the collection. Primary actions say **Create a Riff**; galleries say **Community Riffs**. “Check out my Riff on [game title]” is the intended sharing language. Remixing components can describe the process. Follow [BRAND.md](../BRAND.md#riff-product-naming) for compatibility and naming rules.

## Riff discovery controls

Navigation uses **Lobby Games / Play or Riff** and **AI Agents / Speedrun**. The destinations remain `/games` and `/agent-start`.

The preset Riff builders and their **Roll my Riff** controls were removed in the 2026-09-26 fresh start. A new Riff system is planned (see `docs/PLAN.md`); define its controls here when it exists.

## Daily Spark wallet preview

The Daily Spark title and “A wXTM lock-up trivia game” subtitle use OotleReward, the in-game display font, with dimensional purple shadow. The shared app header uses one fixed-size flip button, separate from AI Sparks: Connect wallet → 10,000 wXTM / Staked → Connect wallet. Use a 380ms vertical flip, immediate with reduced motion or effects off. The accessible pressed state tracks the visible face. Its tooltip explains that the amount is a presentation placeholder, no wallet is connected and no funds are staked. No dialog or duplicate stake block. This is presentation only: never request accounts, sign, transfer, approve tokens or invent balances. Replace the placeholder only after a real adapter and verified balance source are implemented.

### Primary navigation button surfaces

Lobby Games / Play or Riff and AI Agents / Speedrun always retain purple raised surfaces, visible borders and a muted lime lower edge, including on Home. Hover and keyboard focus brighten the edge; the active route adds a stronger lime underline. Never restrict the entire button treatment to the active route. Keep the labels and responsive right-grouped placement.

### Header wallet and Creator Stack arrangement

Connect wallet sits at the top-right, purple on the connect face and lime on the staked face. Creator / Stack is a two-line label in the same raised purple panel treatment as Lobby Games and AI Agents. On narrow widths the logo/wallet form the top row, all three navigation controls share the next row, and countdown/AI Sparks remain below. Wide headers group navigation and wallet beside the logo.

### Discovery placement and stream chat (September 25)

Homepage keeps its playable release feature, Fresh Drops and the two starter-cover cards (Your next Riff is right here). The community invitation/In the spotlight now lives on `/projects` except the management view. The four-step creator journey is a shared `CreatorJourney` component on `/create`'s initial view. Existing resource, game and project destinations are preserved.

Community chat reuses the existing sidebar, API polling, moderation and composer; no new chat service. Its stream-style treatment uses compact inline rows, colored names, dark flat surfaces and a purple send button. `chat/sampleConversation.ts` supplies a visibly identified fictional sample conversation, never persisted or sent to the API. Nine messages arrive at 0/6/13/20/28/35/43/51/60 seconds of visible active chat time. Closing the sidebar, changing rooms or hiding the page pauses it; reopening resumes and it stops after one minute. A page reload starts a fresh sample. Real messages remain separately labeled and retain reporting controls.

### Ootle Templates collection

Creator Stack → Resources → Ootle Templates opens `/ootle-templates`. This dedicated collection aggregates native Ootle starter/component resources, native guides and the `/api/skills` feed. It uses existing source records, resource details and skill detail routes rather than duplicating documentation. Search matches across all three groups. Counts reflect the loaded catalog; independent source errors offer retry while keeping successful results available. Resource readiness and skill lifecycle stay visible. Menu columns align at the top with shared minimum row heights; Resources has four entries, without recentering shorter groups. Mobile uses the existing scrollable stacked menu and a single-column collection.

Creator Stack → Updates contains Marketing calendar, Creator Journal and Growth Dashboard (`/growth`), using the same aligned link and hint treatment.

Agent onboarding is site-first: `/agent-start` renders the full guide with linked role and skill instructions, readable tables and ordered checklists. Private repository access is not an onboarding prerequisite. The agent-facing documents are listed at `/api/agent-docs`; `/agent-start.md` and `/llms.txt` serve the plain-text entry points.
