-- INTEGRATION_GAP[COMMUNITY-CALENDAR-METRICS]: apply through the existing private database migration workflow.
CREATE SCHEMA IF NOT EXISTS lobby_calendar;
REVOKE ALL ON SCHEMA lobby_calendar FROM PUBLIC;
CREATE TABLE IF NOT EXISTS lobby_calendar.metadata (
  id integer PRIMARY KEY CHECK(id=1), started_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO lobby_calendar.metadata(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS lobby_calendar.links (
  token_hash text PRIMARY KEY CHECK(token_hash ~ '^[a-f0-9]{64}$'),
  provider text NOT NULL CHECK(provider IN ('google','apple','download')),
  created_at timestamptz NOT NULL DEFAULT now(),
  first_fetched_at timestamptz, last_fetched_at timestamptz, last_repeat_at timestamptz, last_download_at timestamptz,
  fetch_count bigint NOT NULL DEFAULT 0,
  excluded boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS lobby_calendar.actions (
  id uuid PRIMARY KEY, token_hash text NOT NULL REFERENCES lobby_calendar.links(token_hash),
  kind text NOT NULL CHECK(kind IN ('click','download')), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS calendar_actions_date ON lobby_calendar.actions(created_at);
CREATE INDEX IF NOT EXISTS calendar_actions_link ON lobby_calendar.actions(token_hash);
CREATE TABLE IF NOT EXISTS lobby_calendar.limits (
  key text PRIMARY KEY, window_at timestamptz NOT NULL, count integer NOT NULL
);
ALTER TABLE lobby_calendar.metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_calendar.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_calendar.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_calendar.limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA lobby_calendar FROM PUBLIC;
-- Reuse only the existing backend identity; no new role, public Data API or credentials.
DO $$ DECLARE table_name text; browser_role text; BEGIN
  FOREACH browser_role IN ARRAY ARRAY['anon','authenticated'] LOOP
    IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname=browser_role) THEN
      EXECUTE format('REVOKE ALL ON SCHEMA lobby_calendar FROM %I',browser_role);
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA lobby_calendar FROM %I',browser_role);
    END IF;
  END LOOP;
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='ootle_chat_preview') THEN
    GRANT USAGE ON SCHEMA lobby_calendar TO ootle_chat_preview;
    GRANT SELECT,INSERT,UPDATE,DELETE ON lobby_calendar.links,lobby_calendar.actions,lobby_calendar.limits TO ootle_chat_preview;
    GRANT SELECT ON lobby_calendar.metadata TO ootle_chat_preview;
    FOREACH table_name IN ARRAY ARRAY['metadata','links','actions','limits'] LOOP
      IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='lobby_calendar' AND tablename=table_name AND policyname='calendar_backend') THEN
        EXECUTE format('CREATE POLICY calendar_backend ON lobby_calendar.%I TO ootle_chat_preview USING(true) WITH CHECK(true)',table_name);
      END IF;
    END LOOP;
  END IF;
END $$;
