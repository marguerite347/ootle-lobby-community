-- Additive and repeatable. Deploy before enabling CHAT_PRIVATE_ENABLED=1.
CREATE TABLE IF NOT EXISTS community_chat.private_identities (
 account_id text PRIMARY KEY REFERENCES community_chat.accounts,
 pubkey text UNIQUE NOT NULL CHECK(pubkey ~ '^[a-f0-9]{64}$'),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS community_chat.private_challenges (
 account_id text PRIMARY KEY REFERENCES community_chat.accounts,
 pubkey text NOT NULL, nonce text NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS community_chat.private_contacts (
 id text PRIMARY KEY, low_id text NOT NULL REFERENCES community_chat.accounts,
 high_id text NOT NULL REFERENCES community_chat.accounts,
 requester_id text NOT NULL REFERENCES community_chat.accounts,
 state text NOT NULL CHECK(state IN ('pending','accepted','declined','blocked')),
 action_by text NOT NULL REFERENCES community_chat.accounts,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(low_id,high_id), CHECK(low_id < high_id),
 CHECK(requester_id IN (low_id,high_id)), CHECK(action_by IN (low_id,high_id))
);
CREATE TABLE IF NOT EXISTS community_chat.private_messages (
 id text PRIMARY KEY, contact_id text NOT NULL REFERENCES community_chat.private_contacts,
 sender_id text NOT NULL REFERENCES community_chat.accounts,
 recipient_id text NOT NULL REFERENCES community_chat.accounts,
 sender_key text NOT NULL, recipient_key text NOT NULL,
 sender_wrap jsonb NOT NULL, recipient_wrap jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), received_at timestamptz,
 CHECK(sender_id <> recipient_id)
);
CREATE INDEX IF NOT EXISTS private_messages_history ON community_chat.private_messages(contact_id,created_at,id);
CREATE INDEX IF NOT EXISTS private_messages_unreceived ON community_chat.private_messages(recipient_id) WHERE received_at IS NULL;
DO $$
DECLARE tab text;
BEGIN
 FOREACH tab IN ARRAY ARRAY['private_identities','private_challenges','private_contacts','private_messages'] LOOP
  EXECUTE format('ALTER TABLE community_chat.%I ENABLE ROW LEVEL SECURITY', tab);
  EXECUTE format('REVOKE ALL ON community_chat.%I FROM PUBLIC', tab);
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
   EXECUTE format('REVOKE ALL ON community_chat.%I FROM anon', tab);
  END IF;
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
   EXECUTE format('REVOKE ALL ON community_chat.%I FROM authenticated', tab);
  END IF;
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='ootle_chat_preview') THEN
   EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON community_chat.%I TO ootle_chat_preview', tab);
   IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='community_chat' AND tablename=tab AND policyname='backend_only') THEN
    EXECUTE format('CREATE POLICY backend_only ON community_chat.%I FOR ALL TO ootle_chat_preview USING(true) WITH CHECK(true)', tab);
   END IF;
  END IF;
 END LOOP;
END $$;
