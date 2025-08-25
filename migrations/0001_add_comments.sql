CREATE TABLE IF NOT EXISTS "comments" (
  "id" serial PRIMARY KEY,
  "slug" varchar(255) NOT NULL,
  "author" varchar(80) NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_comments_slug_created_at" ON "comments" ("slug", "created_at" DESC);
