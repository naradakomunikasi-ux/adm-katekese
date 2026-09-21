CREATE INDEX IF NOT EXISTS idx_journey_events_participant_occurred
ON participant_journey_events(participant_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_pastoral_notes_participant_visibility_created
ON pastoral_notes(participant_id, visibility, created_at DESC);
