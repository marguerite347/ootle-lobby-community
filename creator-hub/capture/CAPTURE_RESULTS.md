# Local capture run: 2026-09-21

Smooth 1280×800 webpage previews were captured and assembled into the local hub at port 4189. Clips are approximately 12 seconds, muted H.264, with a hero hold, eased scrolling and return. These are public webpage recordings, not demonstrated transactions or gameplay. Runtime media stays outside Git.

| App | Result |
| --- | --- |
| LabyrinthOS | Recorded and visually checked |
| Sapient | Recorded and visually checked |
| Tari Universe Web | Recorded public wallet setup screen; no wallet created |
| TariOrg | Recorded and visually checked |
| Caravel | Recorded, visually checked, hover playback verified in hub |
| SOOON FUN | Same-session retry succeeded; recorded public animated entrance screen, with no wallet interaction |
| Tari Market | HTTP 503 on initial attempt and retry; fallback retained |
| Ootle Playground | HTTP 403; fallback retained |
| ShadowTix | DNS resolution failure; fallback retained |
| Private Ballot / Tari Agent Pay | No public runnable website configured; generated covers retained |

Reproduce with the capture README. Inspect the per-site output and manifest before claiming successful recording. The failed sites need a later retry or a working public URL. The first recording can fail; a same-session retry now recovers this condition. Document scrolling may remain static on short pages or nested-scroll apps.

Files on this host: capture/out holds the successful recordings and their manifest; hub/data/previews serves the assembled media. These files must be copied to runtime storage on another host; merging code does not transfer clips. No public deployment was performed.

Playback follow-up: clips now autoplay while visible across all hub media surfaces. Four clips were refreshed with symmetric scrolling; LabyrinthOS retained its earlier successful capture after the refresh failed. SOOON was added after a successful same-session retry. Learn and its workflow detail page were browser-verified after readiness fixes.
