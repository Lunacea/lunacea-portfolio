ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "daily_id" varchar(16) NOT NULL DEFAULT 'xxxxxxxx';
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "tripcode" varchar(16) NOT NULL DEFAULT 'xxxxxxxx';
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "parent_id" integer;

CREATE INDEX IF NOT EXISTS "idx_comments_slug_parent_created_at" ON "comments" ("slug", "parent_id", "created_at" DESC);

