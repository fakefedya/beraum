CREATE TYPE "public"."slide_type" AS ENUM('product_tags', 'promo_card');--> statement-breakpoint
CREATE TABLE "hero_slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"internal_title" text NOT NULL,
	"bucket_name" text DEFAULT 'system-assets' NOT NULL,
	"file_key" text NOT NULL,
	"type" "slide_type" NOT NULL,
	"payload" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
