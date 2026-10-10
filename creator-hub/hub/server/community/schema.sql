-- Private application tables. They are never exposed through the Supabase Data API.
CREATE SCHEMA IF NOT EXISTS community_chat;
REVOKE ALL ON SCHEMA community_chat FROM PUBLIC;
CREATE TABLE IF NOT EXISTS community_chat.accounts (
 id text PRIMARY KEY, provider_id text UNIQUE NOT NULL, name text NOT NULL,
 role text NOT NULL DEFAULT 'member' CHECK(role IN ('member','moderator','owner')),
 blocked boolean NOT NULL DEFAULT false,
 quota_at timestamptz NOT NULL DEFAULT now(), quota_count integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS community_chat.sessions (
 digest text PRIMARY KEY, account_id text NOT NULL REFERENCES community_chat.accounts,
 expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS community_chat.invitations (
 digest text PRIMARY KEY, name text NOT NULL,
 role text NOT NULL DEFAULT 'member' CHECK(role IN ('member','moderator','owner')),
 expires_at timestamptz NOT NULL, redeemed_at timestamptz,
 account_id text REFERENCES community_chat.accounts
);
CREATE TABLE IF NOT EXISTS community_chat.login_states (
 digest text PRIMARY KEY, verifier text NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS community_chat.rate_limits (
 key text PRIMARY KEY, window_at timestamptz NOT NULL, count integer NOT NULL
);
CREATE TABLE IF NOT EXISTS community_chat.channels (
 id text PRIMARY KEY, name text NOT NULL, description text NOT NULL,
 platform text NOT NULL DEFAULT 'ootle', remote_id text,
 visibility text NOT NULL DEFAULT 'workspace' CHECK(visibility IN ('workspace','restricted')),
 connected boolean NOT NULL DEFAULT false, can_post boolean NOT NULL DEFAULT false,
 UNIQUE(platform,remote_id)
);
CREATE TABLE IF NOT EXISTS community_chat.channel_members (
 channel_id text REFERENCES community_chat.channels, account_id text REFERENCES community_chat.accounts,
 PRIMARY KEY(channel_id,account_id)
);
CREATE TABLE IF NOT EXISTS community_chat.messages (
 id text PRIMARY KEY, channel_id text NOT NULL REFERENCES community_chat.channels,
 account_id text REFERENCES community_chat.accounts, author_name text NOT NULL,
 body text NOT NULL CHECK(length(body) BETWEEN 1 AND 4000),
 parent_id text REFERENCES community_chat.messages, platform text NOT NULL DEFAULT 'ootle',
 remote_id text, origin_url text, client_id text,
 created_at timestamptz NOT NULL DEFAULT now(), hidden_at timestamptz,
 UNIQUE(account_id,client_id), UNIQUE(channel_id,platform,remote_id)
);
CREATE INDEX IF NOT EXISTS messages_channel_time ON community_chat.messages(channel_id,created_at,id);
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
CREATE TABLE IF NOT EXISTS community_chat.deliveries (
 id text PRIMARY KEY, message_id text NOT NULL REFERENCES community_chat.messages ON DELETE CASCADE,
 channel_id text NOT NULL REFERENCES community_chat.channels,
 status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sending','delivered','failed','uncertain')),
 remote_id text, receipt_url text, error text, updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(message_id,channel_id)
);
CREATE TABLE IF NOT EXISTS community_chat.reports (
 id text PRIMARY KEY, message_id text NOT NULL REFERENCES community_chat.messages ON DELETE CASCADE,
 account_id text NOT NULL REFERENCES community_chat.accounts, reason text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(message_id,account_id)
);
CREATE TABLE IF NOT EXISTS community_chat.audit (
 id text PRIMARY KEY, account_id text REFERENCES community_chat.accounts,
 action text NOT NULL, subject_id text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
-- A backend-only role owns access. Even if the schema is accidentally added to
-- an exposed-schema list, browser roles have neither grants nor RLS policies.
ALTER TABLE community_chat.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_chat.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_chat.login_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_chat.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_chat.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_chat.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_chat.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_chat.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_chat.typing ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_chat.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_chat.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_chat.audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA community_chat FROM PUBLIC;
INSERT INTO community_chat.channels(id,name,description,connected,can_post) VALUES
 ('lobby','the-lobby','A place to meet, ask questions, and find your people.',true,true),
 ('builders','builders','What are you building? Get another pair of eyes on it.',true,true),
 ('show-and-tell','show-and-tell','Small wins, new releases, and things worth sharing.',true,true)
ON CONFLICT(id) DO NOTHING;
