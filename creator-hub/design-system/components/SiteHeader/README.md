# SiteHeader: Creator Stack

## Implementation brief

Make play and agent building the two visible navigation choices. Keep Lobby Games
with its Play now hint immediately beside Build with an Agent. Put the remaining
header destinations in a right-aligned Creator Stack disclosure, using the inline
layered-card icon and a visible text label. Keep the Ootle launch countdown and
AI Sparks balance visible in a compact status row.

Group the Stack by intent:
- Create: Create, Projects, Challenges.
- Resources: Discover, Learn, Skills.
- Updates: Marketing calendar, Creator Journal.

Search and the effects preference live inside the Stack. Cmd/Ctrl+K continues to
open search even with the Stack closed. The search dialog uses a body portal so
closing the disclosure cannot hide an open search dialog. The effects slot stays
mounted while hidden, preserving HubMotion's preference portal.

Use ordinary navigation links, not application-menu roles. Enter/Space toggles
the disclosure; Tab reaches its contents; Escape closes it and restores trigger
focus. Outside interaction, leaving focus and route changes close it. Highlight
the trigger on a Stack destination and mark the selected link with aria-current.

## Layout and safety boundaries

Use header container width, including the space consumed by chat. Small layouts
put the two primary actions on their own row; the Stack panel becomes a scrolling
single column. Wider layouts use three grouped columns. Keep 44px targets,
visible focus, bounded panel height, and no hover-only controls. Do not rewrite
routes, search behavior, wallet state, countdown logic, rewards, or chat.

Reuse receipt: existing React Router links, QuickSearch, LaunchTicket,
SparkBalance, HubMotion and brand tokens. No new dependencies or runtime changes.

## Acceptance checks

Inspect desktop and phone widths, with chat open and closed. Exercise Stack
open/close, Escape/focus return, outside click, link navigation, direct routes,
search by click and shortcut, and the persistent effects toggle. Confirm no
horizontal overflow or header collisions, and that the calendar and journal
remain discoverable. Run the client suite and build. Preserve local runtime and
media while serving the updated bundle. Record observed results in the PR.

September 25 verification: client suite 131/131 and build pass. Chromium checks
at 375, 390, 768, 1024 and 1440px found no horizontal overflow. Inspected phone
and desktop screenshots. Calendar navigation, Escape return focus, hidden-Stack
search shortcut and dialog-close focus passed. Independent source review cleared
the server-guide navigation and search focus fixes. Header height is measured
with ResizeObserver to keep the panel within the viewport beside chat.

## Browser history and delivered shell versions

The production entry installs a `pageshow` restoration check on read-only
`/games`, `/explore`, `/learn` and `/skills` routes. On a back/forward-cache
restore it compares the loaded hashed entry with uncached same-origin HTML.
A changed hash triggers a reload only if the page has had no input/change
interaction and has no open chat, dialog, editable content or embedded player.
Safety is checked again after fetching. Offline or unrecognized HTML does not
reload. Editors and the homepage reward game are excluded; no runtime data or
storage is cleared. This deliberately favors preserving work over forced freshness.

An already cached document from before this check was shipped cannot execute the
new listener: navigate freshly once to adopt it. Verification must distinguish
fresh loads from restored history and test both unchanged and changed bundles.

Desktop alignment: Lobby Games, Build with an Agent and Creator Stack form one
right-aligned group. The primary navigation owns the auto left margin; Stack has
no auto margin at desktop widths. Load CreatorStack.css after Shell.css so legacy
header breakpoints cannot override this layout. Below 760px of header space, keep
the primary actions on their own full-width row.
