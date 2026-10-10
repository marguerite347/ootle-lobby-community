-- Apply before deploying the chat experience upgrade. Existing server role only.
CREATE TABLE IF NOT EXISTS community_chat.reactions (
 message_id text NOT NULL REFERENCES community_chat.messages ON DELETE CASCADE,
 account_id text NOT NULL REFERENCES community_chat.accounts ON DELETE CASCADE,
 emoji text NOT NULL CHECK(emoji IN ('👍','❤️','😂','🎉','👀','🚀')),
 PRIMARY KEY(message_id,account_id,emoji)
);
ALTER TABLE community_chat.reactions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON community_chat.reactions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_chat.reactions TO ootle_chat_preview;
CREATE POLICY backend_only ON community_chat.reactions FOR ALL TO ootle_chat_preview USING (true) WITH CHECK (true);
