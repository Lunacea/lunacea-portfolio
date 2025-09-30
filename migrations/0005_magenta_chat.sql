CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" varchar(64) NOT NULL,
	"path" varchar(512) NOT NULL,
	"slug" varchar(255),
	"referrer" varchar(512),
	"duration_ms" integer,
	"meta" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_view_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"view_day" varchar(10) NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "is_checked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "analytics_events_type_idx" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "analytics_events_path_idx" ON "analytics_events" USING btree ("path");--> statement-breakpoint
CREATE INDEX "analytics_events_created_idx" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "post_view_events_slug_idx" ON "post_view_events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "post_view_events_day_idx" ON "post_view_events" USING btree ("view_day");