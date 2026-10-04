# Tari Workbench: front end and integration contract

The lobby’s Workbench button opens `/workbench`. Its composition follows the supplied Remix IDE reference: activity rail, contextual/file sidebar, tabbed CodeMirror editor and Home, bottom output, and an optional Tari Assistant. The Lobby has a 🛠️ Workbench entry instead of a Creator dropdown. Former Creator links and resource search live under Workbench’s Learn tool; the effects toggle remains in the Lobby footer. The Workbench brand link visibly says Back to Lobby. No Remix branding or Ethereum/Solidity behavior is copied.

## Working now

- Browser-local workspaces, saved edits, file creation/rename, code tabs, Rust syntax highlighting, undo/redo and editor search. The Search tool finds text across workspace files.
- Import text files/folders as a new workspace. Dependency/output/credential paths are excluded. Limits: 100 files, 300 KB/file, 2 MB/workspace, 12 workspaces. Imports do not overwrite another workspace.
- ZIP source export and ZIP submission export with `ootle-submission.json`. Submission export is a draft, never a public listing.
- A Counter starter reused from `creator-hub/skills/examples/counter` at revision `20ae2ae`, including its pinned Cargo manifest, lockfile and tests. Prior validation scope is in that skill’s metadata; edits made in the IDE require a new compile/test.
- Publish form with separate `community` and `october-2026` destinations; browser-local metadata, preview, URL validation, and explicit pending-review versus published results.
- Home has **Community Projects** for published non-contest work. October Submissions consumes only `october-2026` publications. Neither gallery reads local drafts; records must come from the publication service with `status: published`. October records already in the forum feed are deduplicated by exact source repository URL.

See [the repository-wide development register](DEVELOPMENT_GAPS.md) for all Lobby and Workbench integration flags.

## Backend connection point

`creator-hub/hub/server/workbench.mjs` exports `createWorkbenchRouter(services)`. `createInspirationLobby({workbenchServices})` mounts it at `/api/workbench`. Supply implementations before enabling a capability. Defaults are deliberately disconnected: GET capabilities advertises false; mutation endpoints return JSON 501 `NOT_CONNECTED`; the publication list is empty with `connected: false`. There is no fake compilation, AI response, on-chain deployment, hosted project store, or successful publication.

Every service receives the Express request and returns JSON. Implement authentication, ownership/authorization, CSRF/origin checks, rate limits, payload validation and durable storage in the service layer. Keep compiler execution isolated, with filesystem/network/resource limits. Never execute supplied project code in the web-server process. The retired legacy `/api/projects` hosting routes remain disabled. This contract creates a separate integration boundary, not a bypass for them.

| Endpoint | Service | Request | Response |
| --- | --- | --- | --- |
| GET `/capabilities` | generated | none | `{version:1,capabilities:{compile,test,deploy,assistant,publish,publications}}` booleans |
| POST `/runs` | `run` | `{workspace,action:'compile'|'test'}` | Run below |
| GET `/runs/:id` | `getRun` | authenticated job ID | Run below |
| POST `/deployments` | `deploy` | `{artifactId,network:'testnet'}` | `{status:'submitted',transactionId,templateAddress?}` |
| POST `/assistant` | `assistant` | `{workspace,message}` | `{message:string}` |
| POST `/publications` | `publish` | `{workspace,...publicationDraft,requestId}` | `{status:'pending-review'|'published',submissionId,publication:Publication|null}` |
| GET `/publications` | `listPublications` | none | `{items:Publication[]}`; public, approved records only |

A Workspace is `{id:string,name:string,files:Record<relativePath,text>,activeFile:string,publication?:PublicationDraft}`. Treat all client values as untrusted. A Run is `{id,status:'queued'|'running'|'succeeded'|'failed',logs:string[],artifact?:{id,templateHash?}}`. Only a successful compile may return a deployable artifact. The UI polls queued/running jobs once per second for up to 90 seconds and cancels on leaving Workbench. Store artifact ownership, source digest and run status server-side; never trust the UI’s source comparison as authorization. Return appropriate HTTP error codes with `{error:string,code?:string}`.

Deployment is testnet-only in this UI. The service must bind the artifact to an authenticated owner, obtain the user's wallet approval in its integration, and distinguish transaction submission from confirmation. A submitted transaction is not claimed as a confirmed template. No keys are collected or stored by the current front end.

The assistant sends workspace files only when the user presses Send and the capability is connected. Add the provider/model selection and disclosure appropriate to the backend your team supplies. There is no bundled AI key or model provider.

## Publication contract

```ts
type PublicationDraft = {
  title: string; summary: string; creator: string;
  repoUrl: string; demoUrl: string;
  destination: 'community' | 'october-2026';
  forumUrl: string; // required only for October
};
type Publication = PublicationDraft & {
  id: string;
  status: 'published';
  publishedAt: string; // ISO date
};
```

POST includes the workspace source files and listing metadata. Honor `requestId` idempotently per authenticated publisher; a retry of the same draft must not create another listing. Return `pending-review` when stored for moderation, and `published` only after the approved item is durably available through GET. Public responses must exclude private workspace data, emails, secrets and moderation notes. Escape/sanitize user content, enforce HTTPS links, and validate all limits server-side. UI renders descriptions as plain text and rejects unsafe URLs in gallery responses.

Destination is exclusive. A `community` publication has no contest membership. For October, the server must verify the live contest window, eligibility and official entry against Council rules. This UI requires a link to the creator's post in thread 396 and explains that publishing a lobby listing does not register the official entry. It must not invent a contest submission or automatically post to the forum. Future months should come from a server-maintained contest registry, replacing the currently explicit October 2026 destination. Moving/changing an accepted destination needs a backend-owned policy and audit record.

Sources: [Tari getting started](https://ootle.tari.com/guides/getting-started/), [bundled Counter](../creator-hub/skills/examples/counter), [October rules](https://community.tari.com/t/ootle-launch-date-and-launch-contest-rules/323/1).

## Validation and reuse receipt

Reused the existing React/Vite shell, `fflate` ZIP export, Counter source/test fixture, existing contest feed and public-repo deployment. Existing editors were game-specific forms rather than a general code IDE; CodeMirror 6 was selected for actual language editing, selection, keyboard commands and accessible content editing. It is installed at exact package versions in the client lockfile and loaded only by the Workbench route. No compiler, wallet connector or AI integration is implied by a catalog entry.

Acceptance: inspect desktop and phone compositions, create/edit/rename a file, reload to prove browser persistence, inspect an exported ZIP, check service-disabled states, and test publication filtering plus pending-review/published contracts. Frontend build and tests are required before deployment. Backend teams should add isolated runner tests, auth/ownership/CSRF tests, wallet integration tests and real durable-publication end-to-end tests before enabling services.

Verified in Chrome on October 4, 2026: file create/edit/rename persisted through reload; source ZIP contained the edited Rust file, manifest and lockfile; submission ZIP retained `status: draft` and `destination: october-2026`; publishing stayed disabled with disconnected services. Layouts at 375, 390, 414, 768, 1024 and 1440 CSS pixels had no document-level horizontal overflow. Test coverage includes 10 client workbench tests, 3 server seam tests and the existing 8 reward-playtest tests. No Rust compilation, AI inference, on-chain transaction or real public publication was performed.
