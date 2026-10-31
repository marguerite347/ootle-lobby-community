# Web image delivery

The October 30 audit of production revision `1b6823239e277460de901b311ff229b55c3b89ba` found at least 14.68 MB of same-origin resource transfers on an uncached homepage load. Cross-origin resources without timing permission were excluded. Seasonal source PNGs ranged up to 2.35 MB, and offscreen video posters downloaded eagerly despite `preload="none"`.

## Selected implementation

Reuse the existing Vite/React site and static asset deployment. The installed `cwebp` CLI and Pillow generate compressed derivatives without adding a runtime image service or changing original artwork. A representative vault and spider conversion was inspected before generating the full set. Existing animations, crops and content remain intact.

- 107 reviewed preview images receive 480/960-pixel WebP variants, capped at their source dimensions.
- Nine seasonal images receive variants sized for their rendered use. The vault is 119 KB rather than 2.35 MB; the small spider is 5.7 KB rather than 638 KB.
- The manifest redirects only known local images and the two established Lobby hostnames. Unknown URLs keep their original behavior.
- Card images use native lazy loading and responsive sources. Video elements mount within 300 pixels of the viewport or on keyboard focus, avoiding eager offscreen poster fetches. Existing user-controlled walkthrough playback and reduced-motion behavior remain.
- Below-fold SVG illustrations load near the viewport. Hero artwork stays immediately available.
- Only content-fingerprinted derivatives receive one-year immutable caching. Original files remain available for source reuse and existing links.

## Updating images

After adding or changing reviewed posters or seasonal artwork, run:

```sh
python3 scripts/optimize-web-images.py
npm test
npm --prefix creator-hub/hub/client test
npm run validate
npm run build:site
```

Local generation requires Pillow and `cwebp`. Commit the manifest and generated WebP files; deployment itself does not require these tools. Add new seasonal artwork to `ART_WIDTHS` using its actual display dimensions. Unknown new media is not automatically optimized until regenerated and reviewed.

The asset test checks source fingerprints, file existence and the 250 KB/960-pixel derivative budget. Browser acceptance checks should include an uncached desktop/mobile arrival, scrolling into a project gallery, playback of an actual recording, and visual comparison of the hero and banner. Compare equivalent viewport/cache conditions and report same-origin transfer totals separately from cross-origin resources. Lab checks do not establish performance on every physical device or network.

## Local verification

Root tests: 76 passed. Client tests: 209 passed. Content validation and the production build/package runtime check passed. Browser checks at desktop and 390-pixel mobile width preserved artwork and page layout without horizontal overflow. A gallery recording completed playback after scrolling into view; no MP4 downloaded on initial arrival.
