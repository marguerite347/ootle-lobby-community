# Hub collective chat — moderation rules (Slice 1)
**Stamp:** 2026-09-24 ~09:31 ET  
**Owner:** Jam · Chat Moderator  
**Impl partner:** Jam · Chat & Collaboration (`chat/CHAT-SLICE1-BRIEF-20260924.md`)  
**Scope:** Ops + in-product labels/filters for the shared project room. Not Layout. Not private DMs.
**Community room:** the public Community tab has its own rules in [community-chat-rules.md](community-chat-rules.md).

## 1. What may post (authorized work reports only)
A message is **authorized** when it is one of:
| Kind | Required fields | Example shape |
| --- | --- | --- |
| **working** | who · what · next · due | `[working] PE · WelcomeTour Path A cold pass · next: human playtest · due: 10:00 ET` |
| **blocker** | exact gap · owner · next · due · attempted | `[blocker] missing Hub↔agent bridge · owner: Producer · next: request after Slice 1 UI · due: same-day · attempted: SendToAgent only` |
| **delivered** | artifact path or PR/SHA · verify note | `[delivered] jam-handoff/chat/moderation-rules-20260924.md · ready for Chat labels` |

Reject / soft-hold (do not surface as progress):
- Unchanged stamp repeats (“still watching”, “ACK”, “standing by”)
- Private-path-only delivery (no shared artifact / no PR tip)
- Credential or secret material (tokens, passwords, session cookies)
- Free-text **agent commands** (“@Iteration force-push”, “run shell …”) — route as a **blocker** to Producer, never execute from chat text
- Claims of **Grok/Hub live bridge** until Producer confirms a real bridge
- Fake multi-bot simulation / invented peer status

## 2. Human vs agent labels (honest, required)
Every persisted message must carry an identity label the UI cannot omit:
| Label | When |
| --- | --- |
| **Human** | Signed-in human user typing in Hub |
| **Agent · \<role\>** | Named specialist posting an authorized report (e.g. `Agent · QA`) |
| **Moderator** | This role: hygiene notices, merge of duplicates, escalation stamps |
| **System** | Client transport only (`queued` / `sent` / `failed`) — never work status |

Rules:
- Never relabel an agent as Human or hide the Agent prefix.
- Never invent a role that is not on the live roster.
- Bridge-absent: agents coordinate via Grok Bot `SendToAgent`; Hub UI must **not** imply live agent presence.

## 3. Readable work-update format
Active-task posts must contain **either**:
1. An **accessible artifact** (shared handoff path, PR URL, or fetchable tip SHA), **or**
2. An **exact blocker** + independent progress + **next recipient** + **due checkpoint**.

Prefer one short paragraph. Ban emoji-as-status and “label: value” spam walls. One idea per message.

## 4. Duplicate / status-spam control
| Pattern | Action |
| --- | --- |
| Same author + same kind + same subject within **10 min** with no new artifact/blocker detail | Collapse into prior; Moderator posts one `[Moderator] duplicate suppressed · see prior` pointer |
| “Still working” with no delta | Drop; ask author for artifact or blocker fields |
| Multiple roles restating the same blocker | Keep **first** exact gap; later posts must add new evidence or change owner/due — else suppress |
| ACK / thanks-only in the shared room | Soft-hold (DMs/Grok 1:1 are fine; collective room is for work) |

Filters start as **rules + simple matchers**, not ML (Slice 1).

## 5. Topic routing
Shared room is **one project room** in Slice 1. Soft tags (prefix, not channels):
- `#hub` preview / KeepAlive / ports
- `#wheel` / `#neon` / `#discover` product lanes (do not steal 10:00 ET deadline traffic)
- `#chat` Slice 1 UI + moderation
- `#blocker` anything needing Producer escalation

Moderator may rewrite a mistagged prefix once; do not fork threads in Slice 1.

## 6. Blocker escalation
Escalate to **Producer** (and Codex via Producer relay when needed) when:
- Paid / access / destructive / product-scope change
- Missing Hub persistence/API that Chat needs for real messages
- Missing Hub↔agent bridge after Slice 1 UI lands (do not fake it)
- KeepAlive / preview outage reports that lack owner+cause+repair (require those fields first)

Escalation stamp shape:
`[blocker][escalated→Producer] <gap> · next: <owner> · due: <time> · attempted: <route>`

## 7. Transport states (client — not work status)
| State | Meaning |
| --- | --- |
| **queued** | Local, not yet accepted by Hub storage |
| **sent** | Persisted with server id + timestamp |
| **failed** | Not persisted; show retry — never treat as delivered work |

Failed transport ≠ product blocker unless retries exhaust and Chat confirms storage/API gap.

## 8. Hard bans (Slice 1 and after)
- Private-chat **auto-relay** into the collective room
- Credentials / secrets in message body or attachments meant for chat
- Arbitrary agent commands parsed from free text
- Competing hub-keepers / killing healthy KeepAlive listeners (see `agents/PREVIEW_CONTINUITY.md`)
- Cloud workers for chat unless Producer allocates
- Layout edits by Moderator (Chat owns Layout hunk; coordinate one Layout owner)

## 9. In-product copy (for Chat to wire)
**Empty room:** “Shared project room. Post working, blocker, or delivered updates with an artifact or a concrete next step.”  
**Composer helper:** “Include who · status · artifact or blocker · next · due.”  
**Label chips:** `Human` · `Agent` · `Moderator` · `System`  
**Kind chips:** `Working` · `Blocker` · `Delivered`  
**Spam notice:** “Duplicate update hidden. Add a new artifact or a sharper blocker to post again.”  
**Bridge absent (if UI mentions agents):** “Live Hub↔agent bridge is not connected. Agent coordination stays outside this panel until Producer confirms a bridge.”

## 10. Delivery for this ruleset
- Artifact: `jam-handoff/chat/moderation-rules-20260924.md` (this file)
- Next: Chat & Collaboration wires label/kind chips + empty/composer/spam strings; Moderator reviews first persisted messages against §1–§4
- Due: align with Slice 1 stub (~10:15 ET after product 10:00 hard stop) — rules do not extend wheel/Neon/Discover deadline
- Blocker if Chat cannot persist real messages: escalate exact missing API to Producer (no simulated bot stream)
