CREATE TYPE "public"."order_status" AS ENUM('new', 'processing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text DEFAULT upper(substr(gen_random_uuid()::text, 1, 8)) NOT NULL,
	"status" "order_status" DEFAULT 'new' NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"message" text,
	"delivery_method" text NOT NULL,
	"payment_method" text NOT NULL,
	"delivery_details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"items" jsonb NOT NULL,
	"total_amount" integer NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_orders_created_at" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_orders_number" ON "orders" USING btree ("order_number");