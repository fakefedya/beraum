CREATE TYPE "public"."request_status" AS ENUM('new', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('consultation', 'partnership', 'support');--> statement-breakpoint
CREATE TABLE "feedback_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "request_type" NOT NULL,
	"status" "request_status" DEFAULT 'new' NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"message" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_feedback_type" ON "feedback_requests" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_feedback_status" ON "feedback_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_feedback_created_at" ON "feedback_requests" USING btree ("created_at");