CREATE TABLE "post_rating_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"vote_value" varchar(8) NOT NULL,
	"daily_id" varchar(16) NOT NULL,
	"tripcode" varchar(16) NOT NULL,
	"vote_day" varchar(10) NOT NULL,
	"voted_at" timestamp DEFAULT now() NOT NULL
);
