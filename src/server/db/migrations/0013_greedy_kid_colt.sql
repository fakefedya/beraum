ALTER TABLE "feedback_requests" ADD COLUMN "ticket_number" text DEFAULT upper(substr(gen_random_uuid()::text, 1, 8)) NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_feedback_ticket" ON "feedback_requests" USING btree ("ticket_number");--> statement-breakpoint
ALTER TABLE "feedback_requests" ADD CONSTRAINT "feedback_requests_ticket_number_unique" UNIQUE("ticket_number");