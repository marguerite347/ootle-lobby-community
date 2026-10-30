CREATE SCHEMA IF NOT EXISTS lobby_intake;
REVOKE ALL ON SCHEMA lobby_intake FROM PUBLIC;
CREATE TABLE IF NOT EXISTS lobby_intake.submissions (
  id uuid PRIMARY KEY,
  client_id uuid UNIQUE NOT NULL,
  payload jsonb NOT NULL,
  payload_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewed','declined','test')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  review_note text NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS lobby_intake.limits (
  key text PRIMARY KEY,window_at timestamptz NOT NULL,count integer NOT NULL
);
CREATE TABLE IF NOT EXISTS lobby_intake.reviews (
  id uuid PRIMARY KEY,submission_id uuid NOT NULL REFERENCES lobby_intake.submissions,
  reviewer text NOT NULL,status text NOT NULL,note text NOT NULL,created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS submissions_review_queue ON lobby_intake.submissions(status,created_at);
ALTER TABLE lobby_intake.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_intake.limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_intake.reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA lobby_intake FROM PUBLIC;
