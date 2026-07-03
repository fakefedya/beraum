CREATE TYPE "public"."slide_placement" AS ENUM('home_hero', 'catalog_hero');--> statement-breakpoint
ALTER TABLE "hero_slides" RENAME TO "slides";--> statement-breakpoint
ALTER TABLE "product_media" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."media_type";--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'user_instruction', 'service_instruction', 'certificate');--> statement-breakpoint
ALTER TABLE "product_media" ALTER COLUMN "type" SET DATA TYPE "public"."media_type" USING "type"::"public"."media_type";--> statement-breakpoint
ALTER TABLE "slides" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."slide_type";--> statement-breakpoint
CREATE TYPE "public"."slide_type" AS ENUM('promo_product', 'promo_information');--> statement-breakpoint
ALTER TABLE "slides" ALTER COLUMN "type" SET DATA TYPE "public"."slide_type" USING "type"::"public"."slide_type";--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "placement" "slide_placement" DEFAULT 'home_hero' NOT NULL;--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "mobile_file_key" text;