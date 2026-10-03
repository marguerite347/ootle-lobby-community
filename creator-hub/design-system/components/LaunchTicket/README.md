# LaunchTicket

Live countdown chip in the header for the Ootle mainnet launch (11.11 · 11:11 UTC), linking to the waitlist.

Static rendition of `LaunchTicket()` in `components/OotleLaunch.tsx` (styles in `Journal.css`). No props: it reads `content/launch.json` and ticks every second. The consumer keeps the accessible label spelling out the date and action.

- Purple-ink ticket (`linear-gradient(115deg,#29203b,#17151f)`, radius 13px) with a beaconing lime dot and four digit windows; seconds sit in a lime window.
- Hover lifts 2px, borders go `tari-green` and a shine sweeps once. Digits tick in with a short drop. All motion stops under reduced motion and effects off.
- Under 520px the join text hides. After launch it becomes a plain "Launch updates ↗" link.
- Keep the date factual; never imply service availability the launch has not delivered.
