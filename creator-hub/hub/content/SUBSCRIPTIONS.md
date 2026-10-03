# Ootle launch and subscriptions

Launch configuration: `content/launch.json`. User-confirmed target is November 11,
2026 at 11:11 UTC. The countdown stops at zero and asks readers to follow launch
updates; reaching zero never asserts mainnet is live. Change planned dates here.

## Cloud provider connection (not yet configured)

Set server-only environment variables:

- `SUBSCRIPTION_WEBHOOK_URL`: trusted HTTPS cloud adapter endpoint.
- `SUBSCRIPTION_WEBHOOK_TOKEN`: bearer credential for that adapter; never put in client/Git.
- `SUBSCRIPTION_PRIVACY_URL`: the operator's published HTTPS privacy notice.
- `PUBLIC_SITE_URL`: canonical public origin, e.g. the deployed site's HTTPS origin.

Without all three subscription values, the form shows “Signups are opening soon”
and does not collect email. It never writes subscriber data to local files or Git.
A configured endpoint is availability, not proof of delivery; verify it before launch.

## Adapter contract

POST JSON with `email`, `topics` (launch/events/journal), `consentVersion`,
`consentedAt`, `source`, `doubleOptIn: true`. Authentication uses Authorization Bearer.
The Idempotency-Key identifies normalized email + topic selection per UTC day.
Adapter must merge preferences without duplicating contacts, handle retries idempotently,
respect prior suppression/unsubscribe, and initiate explicit double opt-in for new or
resubscribing contacts. Do not automatically re-subscribe suppressed contacts.

Return a successful HTTP response with `{ "status": "pending_confirmation" }` only
after durable cloud acceptance of the confirmation request. The Hub then says to check
the inbox; it does not claim a confirmed subscription. Provider failures/timeouts return
an honest error, with no private provider response logged or exposed.

Use provider-managed confirmation, preference center and unsubscribe links in every
email. No outbound campaign is authorized by wiring this adapter. Cloud delivery remains
a connection task, not a local subscriber database. Do not expose a subscriber-list API.

## Production readiness backlog

Choose the provider/account and controller privacy terms; provision adapter + secret;
configure confirmation and unsubscribe templates; implement cloud storage with retention
and deletion; validate abuse protection across replicas (current in-memory rate limiter
is per-process only); run consented end-to-end confirmation/unsubscribe and retry tests;
verify errors produce no PII logs. Decide email cadence and authenticate sending domain.

Prototype flow: header ticket or homepage invitation → /ootle → select update topics
(default launch, events, journal) → explicit consent → provider confirmation email →
confirmed provider subscription. Blog signup defaults to journal only. Topics can be
unchecked independently. No cookie or browser storage contains the email address.
