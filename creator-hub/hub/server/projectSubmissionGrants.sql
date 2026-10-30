-- Apply after projectSubmissions.sql using the database operator connection.
-- Reuse the existing application role; never grant browser roles access.
REVOKE ALL ON SCHEMA lobby_intake FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA lobby_intake FROM anon, authenticated;
GRANT USAGE ON SCHEMA lobby_intake TO ootle_chat_preview;
GRANT SELECT, INSERT, UPDATE ON lobby_intake.submissions TO ootle_chat_preview;
GRANT SELECT, INSERT ON lobby_intake.reviews TO ootle_chat_preview;
GRANT SELECT, INSERT, UPDATE, DELETE ON lobby_intake.limits TO ootle_chat_preview;
CREATE POLICY intake_backend ON lobby_intake.submissions TO ootle_chat_preview USING (true) WITH CHECK (true);
CREATE POLICY intake_backend ON lobby_intake.reviews TO ootle_chat_preview USING (true) WITH CHECK (true);
CREATE POLICY intake_backend ON lobby_intake.limits TO ootle_chat_preview USING (true) WITH CHECK (true);
