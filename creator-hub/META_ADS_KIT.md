# Optional library resource: Meta advertising and measurement

Proposed resource entry, 2026-09-19. CH-017 tracks documentation and example curation. This is offered alongside Ootle template examples and other creator resources. Browsing, building, publishing, earning achievements and participating in the community never require Meta, advertising or tracking installation.

## Library entry

| Field | Content |
| --- | --- |
| What it is | Optional external integration examples for Meta Pixel, Conversions API and campaign setup |
| What it is used for | Measuring visits and meaningful conversions from Facebook/Instagram campaigns when a creator chooses paid promotion |
| How it works | Browser Pixel events and permitted server-side events support measurement; the separate Marketing API can manage authorized ads |
| Where it fits | A project's web frontend/backend and optional promotion workflow; it is not a native Ootle contract or required template dependency |
| Where it has been used | Link verified projects, implementations or case studies with source, date and actual integration details. No Tari/Ootle adoption example has been verified yet |
| Examples to offer | Attributed upstream SDK examples, a browser event example, a server event/deduplication example and an Ads Manager setup guide, with validation and license labels |
| Prerequisites if adopted | Relevant Meta assets and permissions, consent/data handling and account-specific advertising eligibility; credentials and billing remain with the creator |
| Current availability | Documentation proposal and source links only; no working Tari adapter, hosted connector or ad launcher has been built |

## Shared resource format

Use this same format for existing Ootle templates: purpose, how it works, inputs/outputs, use cases, verified projects using it, example code/demo, dependencies, compatibility, license, source and last verification date. Distinguish a suggested use case from demonstrated adoption. Clearly label native Ootle templates, external integrations and conceptual examples so browsing them together does not imply compatibility.

A creator should be able to browse, understand, inspect an example and decide whether to use it. Account connection is relevant only after they voluntarily choose to implement an integration. Do not place Meta setup in Ootle Lobby onboarding or attach it to achievements or discoverability eligibility.

## Documentation and example scope

- Curate primary documentation and appropriately licensed examples before proposing custom SDK development.
- Explain browser versus server events and matching event IDs for deduplication. Label examples as tested or untested with applicable API version.
- Demonstrate meaningful outcomes such as a completed registration or verified purchase. A download click is not a confirmed install; a testnet transfer is not revenue.
- Explain that Pixel does not observe private Ootle activity. Keep secrets server-side; exclude raw wallets, private transactions and free-text content from example payloads. Apply consent and current platform requirements if a creator deploys the example.
- Offer optional campaign briefs and setup walkthroughs. No shared Tari Pixel, cross-creator audience pooling or automatic tracking is part of the library.
- Collect verified usage references over time, preserving attribution and distinguishing external case studies from Tari deployments.

A hosted multi-tenant connector, in-hub ad launcher, paid pilot and DW reporting integration are possible future projects requiring a separate scope decision. None is required to complete this library entry. No advertising spend or ongoing collection is initiated by catalog inclusion.

## Sources and verification limits

- [Meta's official Marketing API collection](https://www.postman.com/meta/facebook-marketing-api/documentation/0zr4mes/facebook-marketing-api-mapi): account/app/token prerequisites, permissions and paused campaign examples verified.
- [Meta Business SDK](https://github.com/facebook/facebook-python-business-sdk): official implementation reference, not an installed dependency.
- [Pixel](https://developers.facebook.com/docs/meta-pixel/), [Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api/), [deduplication](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/): primary implementation references; direct research retrieval was rate-limited. Recheck detailed schemas, terms and supported API version during implementation rather than copying unverified examples.
