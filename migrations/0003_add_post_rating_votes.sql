-- Create post_rating_votes table for article rating votes
CREATE TABLE IF NOT EXISTS post_rating_votes (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) NOT NULL,
  vote_value VARCHAR(8) NOT NULL,
  daily_id VARCHAR(16) NOT NULL,
  tripcode VARCHAR(16) NOT NULL,
  vote_day VARCHAR(10) NOT NULL,
  voted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ensure one vote per day per daily_id per slug
CREATE UNIQUE INDEX IF NOT EXISTS uniq_post_rating_vote_day
  ON post_rating_votes (slug, daily_id, vote_day);

-- Query performance indexes
CREATE INDEX IF NOT EXISTS idx_post_rating_votes_slug
  ON post_rating_votes (slug);

-- Ensure per-client uniqueness for toggle (no date limit)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_post_rating_by_client
  ON post_rating_votes (slug, tripcode);



