-- Additive. Apply before enabling the bridge; secrets and chat content never belong here.
ALTER TABLE community_chat.messages ADD COLUMN IF NOT EXISTS source_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE community_chat.messages ADD COLUMN IF NOT EXISTS source_event_id bigint NOT NULL DEFAULT 0;
ALTER TABLE community_chat.deliveries ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NOT NULL DEFAULT now();
CREATE TABLE IF NOT EXISTS community_chat.forum_events (
 digest text PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE community_chat.forum_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON community_chat.forum_events FROM PUBLIC;
INSERT INTO community_chat.channels(id,name,description,platform,remote_id,connected,can_post)
VALUES('forum-general','Forum · General','Shared with the Lobby public chat.','forum','2',false,false)
ON CONFLICT(id) DO NOTHING;

-- Production uses the existing backend-only role. Local PGlite trials have no such role.
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON community_chat.forum_events FROM anon; END IF;
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON community_chat.forum_events FROM authenticated; END IF;
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='ootle_chat_preview') THEN
  GRANT SELECT,INSERT,UPDATE,DELETE ON community_chat.forum_events TO ootle_chat_preview;
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='community_chat' AND tablename='forum_events' AND policyname='backend_only') THEN
   CREATE POLICY backend_only ON community_chat.forum_events FOR ALL TO ootle_chat_preview USING(true) WITH CHECK(true);
  END IF;
 END IF;
END $$;
