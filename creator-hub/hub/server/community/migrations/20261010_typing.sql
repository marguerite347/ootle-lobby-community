-- Additive migration for the existing hosted chat runtime role. Apply before deploying the typing endpoints.
-- Transient activity only: never store draft text. Each browser has its own lease.
CREATE TABLE IF NOT EXISTS community_chat.typing (
 account_id text NOT NULL REFERENCES community_chat.accounts ON DELETE CASCADE,
 client_id text NOT NULL CHECK(length(client_id) BETWEEN 8 AND 100),
 channel_id text NOT NULL REFERENCES community_chat.channels ON DELETE CASCADE,
 parent_id text REFERENCES community_chat.messages ON DELETE CASCADE,
 expires_at timestamptz NOT NULL,
 PRIMARY KEY(account_id,client_id)
);
CREATE INDEX IF NOT EXISTS typing_channel_expiry ON community_chat.typing(channel_id,expires_at);
ALTER TABLE community_chat.typing ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON community_chat.typing FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_chat.typing TO ootle_chat_preview;
CREATE POLICY backend_only ON community_chat.typing FOR ALL TO ootle_chat_preview USING (true) WITH CHECK (true);
