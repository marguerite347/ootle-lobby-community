# Lobby ↔ Forum General

Status: implemented and tested with a controlled Discourse transport; **not activated or live-verified**. The signed-in `coin_artist` account can read General but `/admin` is unavailable. No forum settings, hooks or messages were changed during preparation. No production migration or credentials have been installed.

## Intended behavior

New public messages in Lobby `#the-lobby` and [Forum General](https://community.tari.com/chat/c/general/2) are shared automatically once activated. Lobby shows `From Lobby` / `From Forum` and a compact notice above the composer. Forum copies show the guest's display name followed by `From Lobby`; they are posted by a labeled incoming webhook, never by impersonating a forum account. Guest names remain unverified. Other Lobby channels, restricted forum categories and all DMs are excluded. Existing history is not imported.

The bridge reuses the private PostgreSQL message/delivery store. Native sends and outbox entries commit together. Concurrent workers claim each delivery once. Signed incoming events deduplicate by event ID/content and imported messages by channel/message ID. Hook-generated echoes only reconcile the originating delivery and are never imported. Forum edits/deletes/restores update the mirror in provider-event order; local moderator hiding remains independent. A late parent currently leaves its earlier-arriving reply at the top level; normal in-order replies map to the original Lobby message. Incoming attachments link to the forum instead of copying files. Long forum text includes an original-message link.

Discourse's incoming hook supports text only. Lobby replies carry a reply attribution in Forum; they are not native Discourse thread replies. Reactions, uploads, and Lobby-side edits/deletions are not relayed. If a moderator hides an already-delivered Lobby message, they must also remove its copy on Forum. Posting a forum copy does not verify a guest's identity.

The incoming hook accepts ten messages per minute. A confirmed 429 remains queued for a later scheduled attempt. Rejected 4xx sends display failed; timeouts, invalid success responses and 5xx are uncertain and are never blindly retried. A later signed hook echo can confirm a timed-out send. A successful `{success:"OK"}` provider response confirms delivery; the later outgoing event adds the exact forum message link. Queued messages require the authenticated scheduler below, not an open browser.

## Forum administrator setup

1. Confirm General (channel **2**, Community category **4**) is intended to share **new public chat** with guest-readable `lobby.tari.com`. Keep its category public. Add a short channel description: `Shared with Lobby chat at lobby.tari.com. New messages appear in both places.` No private channel or historical backfill is authorized by this integration.
2. Under **Admin → Plugins → Chat**, create one incoming webhook targeting **General**. Name and displayed username: **Tari Lobby**. Description: `Public messages from lobby.tari.com, with guest attribution.` Save its native `/chat/hooks/<key>` URL directly as the server-only Vercel `CHAT_FORUM_INCOMING_URL`; never put the secret URL in Git, a forum post, or chat.
3. Under **Admin → API → Webhooks**, prepare a JSON webhook to `https://lobby.tari.com/api/chat/forum/webhook`. Select **Chat message** events (created, edited, trashed, restored), restrict it to **Community category 4**, enable certificate verification, and supply a random secret of at least 32 characters. Save that same secret as `CHAT_FORUM_WEBHOOK_SECRET` in production Vercel. Keep the hook inactive until the deploy/configuration steps below are complete. Do not select all events or private messages. The receiver independently rejects every channel except 2 and restricted categories.

These are narrowly scoped hooks; a broad forum API key or reuse of a personal login session is unnecessary. An authorized forum administrator must perform or approve their creation.

## Operator activation and release

1. Apply `creator-hub/hub/server/community/migrations/20261102_forum_bridge.sql` with the database migration workflow. It adds source moderation/version columns, a delivery retry time, a private event-digest table and an **inactive** Forum destination. Existing message content is preserved. Verify RLS and that only `ootle_chat_preview` has backend access; browser roles must have none.
2. Configure server-only production variables:
   - `CHAT_FORUM_ENABLED=1`
   - `CHAT_FORUM_INCOMING_URL` and `CHAT_FORUM_WEBHOOK_SECRET` from the admin setup
   - `CHAT_FORUM_STARTS_AT`: the actual approved activation time in ISO UTC; do not use an earlier date to backfill
   - `CRON_SECRET`: random secret, at least 32 characters
3. Enable the operator-provisioned destination: `UPDATE community_chat.channels SET connected=true,can_post=true WHERE id='forum-general' AND platform='forum' AND remote_id='2';`
4. Add a Vercel cron to `vercel.json`: `{"path":"/api/chat/forum/flush","schedule":"* * * * *"}` under `crons`, after verifying that the current plan supports minute scheduling. Set the API function's `maxDuration` to at least 60 seconds. Vercel sends `Authorization: Bearer <CRON_SECRET>`. Do not activate without a working scheduler; it recovers committed messages whose request died before dispatch and handles rate limits. This schedule is intentionally not installed while the bridge is inactive.
5. Merge through the owner PR workflow, deploy the **exact merged SHA**, and verify `/build.json`. Activate the forum's outgoing webhook. Confirm `/api/chat/capabilities` reports the General mapping and the cron runs successfully.
6. In separate real Lobby/forum sessions, send clearly labeled connection-test messages in both directions. Confirm names, source labels, one copy only, a native reply and a forum reply, and receipt links. Replay an outgoing test event once and confirm no duplicate. Check a forum edit and soft delete. Verify a DM and another channel do not appear. Inspect the exact served desktop and 390px layout. Record the test message IDs, deployment SHA, scheduler evidence and screenshots privately; never publish runtime message payloads or secrets in the repository.
7. Only after those checks describe the bridge as live. The controlled automated trial is not provider delivery evidence.

Pause immediately with `UPDATE community_chat.channels SET connected=false,can_post=false WHERE id='forum-general';`, then disable the forum outgoing webhook. This pauses new queueing/import/dispatch without changing native chat or erasing messages. To retire, remove `CHAT_FORUM_ENABLED`, the scheduler and credentials and redeploy. Keep schema/history for rollback compatibility. Never reset uncertain deliveries to queued before checking Forum for an existing copy.

## Selection receipt

- **Reuse:** the tested PostgreSQL outbox, guest sessions, moderation, source IDs, Express router and existing React chat. No new package or hosting service.
- **Capability check:** Chat SDK's documented adapter catalog has no Discourse adapter. Discourse's official bundled Chat plugin supports scoped incoming hooks and signed outgoing chat events. Its current controller returns success without a message ID; the implementation uses the outgoing echo to add the remote receipt instead of inventing one.
- **Trial:** PGlite transactions plus controlled provider responses exercise both directions, parallel claims, repeats, signatures, audience filtering, edit ordering, local moderation, rate limits, ambiguous timeouts and HTTP authentication. Real signed-in Forum inspection confirmed General channel 2; admin access is unavailable.
- **Remaining gap:** forum-admin hook configuration, production migration/environment/scheduler, exact-SHA release and real two-way delivery acceptance.
- **Primary sources:** [Discourse Chat integration documentation](https://meta.discourse.org/t/discourse-chat/230881), [incoming hook controller](https://github.com/discourse/discourse/blob/main/plugins/chat/app/controllers/chat/incoming_webhooks_controller.rb), [outgoing event payload](https://github.com/discourse/discourse/blob/main/plugins/chat/plugin.rb), [message serializer](https://github.com/discourse/discourse/blob/main/plugins/chat/app/serializers/chat/message_serializer.rb), [webhook signing](https://github.com/discourse/discourse/blob/main/app/jobs/regular/emit_web_hook_event.rb), [Chat SDK adapter catalog](https://chat-sdk.dev/docs/adapters), [Vercel scheduler authentication](https://vercel.com/docs/cron-jobs/manage-cron-jobs).
