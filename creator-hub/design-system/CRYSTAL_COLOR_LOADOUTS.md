# Crystal color loadouts

These seven tertiary (three-color) loadouts are the design-system options for AI
Spark crystal art direction. Here, “tertiary” means three distinct visual roles,
not a claim that every palette is an evenly spaced color-wheel triad.

The choices are documented for reuse and comparison. Final material/render
acceptance and product integration remain separate from palette selection.
They extend the crystal art palette, not global UI/status tokens.

## Three distinct roles

1. **Edge shadows:** deep, chromatic color for creases, grazing-angle edges and
   shadow-facing planes. Preserve separation between facets; avoid a dense
   wireframe or neutral gray shading.
2. **Facets:** saturated body color, with directional light and dark planes.
   Keep the cut geometry readable while allowing restrained translucency.
3. **Inner glow:** a contrasting color localized to a small core and its halo.
   Use a soft flame-like center with a rounded base, tapered tip and gentle motion, rather than a hard geometric orb. It should feel contained inside the shell. Do not spread emission across
   the entire surface or bleach the facets into milky white.

## Available loadouts

| Loadout | Edge shadows | Facets | Inner glow |
| --- | --- | --- | --- |
| Pink Reactor | Aubergine `#27085E` | Magenta `#EF36C5` | Tari lime `#C9EB00` |
| Plasma | Indigo `#152568` | Tari purple `#813BF5` | Cyan `#00F5DE` |
| Voltage | Deep plum `#421052` | Tari lime `#C9EB00` | Hot pink `#FF3CBA` |
| Aurora | Deep violet `#34105D` | Turquoise `#00CDBC` | Amber `#FFBF38` |
| Nova | Deep violet `#34136F` | Coral `#FF7542` | Ice cyan `#59F5FF` |
| Dark Energy | Midnight violet `#09051C` | Blackcurrant `#39105E` | Tari lime `#C9EB00` |
| Arcade | Deep teal `#0B3554` | Hot pink `#FF3CBA` | Electric lavender `#8F70FF` |

On each fresh crystal load, choose one of the seven loadouts uniformly at random.
Keep that selection stable through the interaction and reward sequence; do not
reroll on spin, animation frames, or viewport changes. An explicit palette
URL parameter on the crystal fixture overrides random choice for internal reviews and deterministic captures. This
visual randomness must never affect reward odds, balances or settlement.

Dark Energy uses a dark blackcurrant shell with midnight-violet edges and a concentrated lime core. Preserve colored facet highlights and the contained electric spark; darkness must not flatten the silhouette into a solid black object.

Use Pink Reactor for a fixed magenta crystal with green energy direction.
Compare alternatives as complete loadouts before mixing individual channels.
Use small specular highlights to convey glass; white must not become a fourth
large-area color. The core must remain distinguishable through the tinted shell.

## Source and maintenance

The executable source is
[`crystal-lab/palettes.js`](../hub/client/public/crystal-lab/palettes.js).
The wheel selector and crystal renderer both import it. Keep names, IDs and hex
values in this guide synchronized with that module in the same change. Do not
copy a competing palette array into another renderer or video composition.

The [wheel proof](http://127.0.0.1:4222/wheel-lab/native.html?v=3) selects a loadout programmatically at startup. The design lab retains palette and energy-style controls for art direction. Do not expose these review controls on the actual website or to players. Electric spark is the default inner energy treatment. Internal capture tools can pass an explicit `palette` ID to the crystal embed for repeatable evidence.

This local URL requires the existing preview service and private assets. Rendering uses a Spline wheel and a separate Three.js crystal; palette selection does not edit the Spline source document.

## Review requirements

- Compare under identical lighting, exposure, scale and camera angle.
- Inspect several rotation angles, including the darkest and brightest facets.
- Check the actual wheel-sized crystal and a close-up, on desktop and phone.
- Confirm that creases are readable, the core is contained, and the shell feels
  substantial rather than ghostlike. Avoid both opaque chalk and excessive glass
  transparency.
- Inspect spark-light peaks as well as the settled state. Effects must not wash
  out the three color roles. Reduced motion preserves the chosen palette.
- Record the chosen loadout and served revision with visual approval. A swatch
  match alone is not acceptance of the rendered material.

Follow [AI Spark Crystal](components/AISparkCrystal/README.md) for geometry and
motion, and [asset integration](ASSET_INTEGRATION.md) for sourcing and licensing.
