ALTER TABLE "products" RENAME COLUMN "ozon_stock" TO "ozon_stock_fbo";--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "wb_stock" TO "fbs_stock";--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "wb_sku" TO "wb_chrt_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "ozon_price";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "wb_price";