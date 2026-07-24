ALTER TABLE "products" ADD COLUMN "wb_discounted_price" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "ymarket_link" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "mvideo_link" text;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "base_price";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "base_stock";