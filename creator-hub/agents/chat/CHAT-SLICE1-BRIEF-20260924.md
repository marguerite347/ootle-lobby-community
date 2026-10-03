# Hub collective chat — Slice 1 brief
**Stamp:** 2026-09-24 ~09:29 ET · Deadline product lanes still **10:00 ET** (wheel/Neon/Discover independent)
**Owners:** **Jam · Chat & Collaboration** (impl) · **Jam · Chat Moderator** (ops/labels/spam)
**Roster check:** No prior Chat/Moderator personas — created this hour.

## Smallest feasible deliverable (Slice 1)
Accessible persistent **launcher** + **sidebar panel** + **pop-out** on any Hub route; one **shared project room**; **persisted real messages** with identity + timestamps; status kinds **working / blocker / delivered** (artifact link optional); client states **queued / sent / failed**.

## File ownership (proposed — Chat confirms before edits)
- New: `creator-hub/hub/client/src/chat/**` (components, store client, styles)
- Layout hook only: minimal import in existing Layout shell (Chat owns PR hunk; coordinate one Layout owner)
- Server: reuse existing Hub persistence if present; else minimal message API under Hub server owned by Chat
- Moderator: `chat/moderation-rules-20260924.md` + in-product copy for labels (no Layout steal)

## Bridge availability (honest)
| Path | Status |
| --- | --- |
| Grok Bot ↔ Grok Bot (`SendToAgent`) | **Available** for specialist coordination outside Hub UI |
| Hub UI ↔ Grok Bot live bridge | **NOT available** as a product connector today — do **not** claim Grok connectivity in-product |
| Hub message persistence | Must use **real** Hub storage/API; no simulated bot stream |
| Missing support to request | Explicit Hub↔agent bridge (auth’d post of authorized work reports only) — Producer/Codex when Slice 1 UI lands |

## Out of Slice 1
Private-chat auto-relay · credentials · arbitrary agent commands from text · fake multi-bot simulation · stopping wheel/Neon/Discover

## ETA
- Spec + stub launcher on branch: **~10:15 ET** (after 10:00 product hard stop — does not extend product deadline)
- Slice 1 usable on a preview Hub: **same day** if storage path is clear; else blocker with exact missing API

## Limitations
No Grok-in-Hub until bridge exists. Mobile pop-out a11y may trail desktop. Moderator spam controls start as rules + filters, not ML.
