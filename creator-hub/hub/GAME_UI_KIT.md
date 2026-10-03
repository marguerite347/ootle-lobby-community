# Reusable game UI kit

Live local route: `/create/ui-kit`, linked from Create. This is a component specimen and setup guide, not another builder or an agent execution endpoint.

## Components and ownership

| Component | Purpose | Live integration |
| --- | --- | --- |
| GameReveal | Motion 13.4.1, one-time viewport entrance, reduced-motion support | Create path selector and specimen |
| CreatorPath | Accessible four-stage journey, current step only | Create; specimen demonstrates step two |
| QuestProgress | Native accessible progress, finite/clamped values | Weekly challenge verified-contribution count |
| SuccessNotice | Bounded CSS success feedback, no sound or payout | Confirmed skill/profile saves and challenge submission |
| CommunityArena | Fetch existing skill-market data, use existing rank calculation and privacy settings | Homepage alongside weekly challenges |
| Existing ProjectCover / PublishedShelf | Real published gameplay footage and project links | Homepage and Discover |

Source: `client/src/components/GameKit.tsx`, `GameKit.css`, `CommunityArena.tsx`. Existing CreatorLeaderboard remains the ranking implementation; no second score database. Existing media/covers remain resource-specific.

## Reuse in a project

Install React 18 or 19 plus `motion@13.4.1`. Copy GameKit.tsx and GameKit.css together. Import only the components needed. Provide `--border`, `--muted`, `--text`, and `--bg-elev` theme variables; game accents have defaults. CreatorLeaderboard separately requires React Router and its accompanying CSS.

Example:

```tsx
import {QuestProgress, SuccessNotice} from './GameKit';

<QuestProgress value={verifiedCount} target={editionTarget} label="Verified contributions" />
{saveConfirmed && <SuccessNotice key={savedRevision}>Your version was saved.</SuccessNotice>}
```

Use a unique saved revision as the success key when successive saves should animate. Mount only after the server confirms success. Effects stop after 900ms and clean up timers on unmount. Reduced-motion mode disables the effect. No sound starts automatically. The specimen uses explicitly labeled illustrative counts and never submits data.

## Validation, September 22

- Production build succeeds; 33 client tests pass, including malformed progress, cap and accessible current-step tests.
- Browser checks on `/`, `/create`, `/explore?type=app`, `/create/ui-kit`, `/challenges` at 390, 768 and 1440px: no horizontal overflow or uncaught page errors.
- Success example clicked and confirmation observed. Homepage standings and published-project 503 failures produce readable error states, without crashing the rest of the page.
- Bundle: 457.98 kB JS / 143.62 kB gzip before final spacing-only CSS adjustment; prior slice 142.75 kB gzip. No WebGL engine or remote runtime introduced.
- This remains local preview validation, not public deployment or a comprehensive accessibility audit.

## Handoff and outstanding scope

Progress belongs to #111 (kit), #112 (homepage), #113 (discovery interactions), #114 (creation), #115 (standings), #116 (events), #118 (validation), and existing #28/#41/#58/#80. Do not close the full epic based on these components alone.

Still needed: selected third-party art/character assets and theme presets, richer creator profile cards, deeper dependency-aware recipe editing, production analytics with release attribution, three configurable VFX/audio recipes, and the independent fork/build/publish acceptance milestone. Real payout settlement remains in the existing rewards work. No resource artwork was replaced with repeated generic covers.
