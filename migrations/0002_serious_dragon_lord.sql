DROP TABLE "counter" CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "daily_id" varchar(16) NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "tripcode" varchar(16) NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "parent_id" integer;