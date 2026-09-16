ALTER TABLE "feedback_requests" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."request_type";--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('consultation', 'partnership', 'support', 'wholesale');--> statement-breakpoint
ALTER TABLE "feedback_requests" ALTER COLUMN "type" SET DATA TYPE "public"."request_type" USING "type"::"public"."request_type";