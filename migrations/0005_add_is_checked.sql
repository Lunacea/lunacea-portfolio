ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "is_checked" boolean NOT NULL DEFAULT false;
-- Optional index for moderation views
CREATE INDEX IF NOT EXISTS "idx_comments_is_checked_created_at" ON "comments" ("is_checked", "created_at" DESC);



