-- post_view_events: 記事閲覧イベント（推移集計用）
CREATE TABLE IF NOT EXISTS post_view_events (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) NOT NULL,
  view_day VARCHAR(10) NOT NULL,
  viewed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS post_view_events_slug_idx ON post_view_events (slug);
CREATE INDEX IF NOT EXISTS post_view_events_day_idx ON post_view_events (view_day);



