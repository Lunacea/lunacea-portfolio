CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  path VARCHAR(512) NOT NULL,
  slug VARCHAR(255),
  referrer VARCHAR(512),
  duration_ms INTEGER,
  meta TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS analytics_events_path_idx ON analytics_events (path);
CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON analytics_events (created_at);



