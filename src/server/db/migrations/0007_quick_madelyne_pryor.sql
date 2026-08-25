CREATE TABLE "media_uploads" (
	"file_key" text PRIMARY KEY NOT NULL,
	"bucket" text NOT NULL,
	"content_type" text NOT NULL,
	"ip_hash" text NOT NULL,
	"claimed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_claimed_by_feedback_requests_id_fk" FOREIGN KEY ("claimed_by") REFERENCES "public"."feedback_requests"("id") ON DELETE set null ON UPDATE no action;