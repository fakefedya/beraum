ALTER TABLE "media_uploads" DROP CONSTRAINT "media_uploads_claimed_by_feedback_requests_id_fk";
--> statement-breakpoint
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_claimed_by_feedback_requests_id_fk" FOREIGN KEY ("claimed_by") REFERENCES "public"."feedback_requests"("id") ON DELETE cascade ON UPDATE no action;