CREATE TYPE "public"."discount_item_status" AS ENUM('available', 'reserved', 'sold');--> statement-breakpoint
ALTER TYPE "public"."request_type" ADD VALUE 'discount_order';--> statement-breakpoint
CREATE TABLE "discount_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"unique_sku" text NOT NULL,
	"defect_description" text NOT NULL,
	"discount_price" integer NOT NULL,
	"media_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "discount_item_status" DEFAULT 'available' NOT NULL,
	"reserved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discount_items_unique_sku_unique" UNIQUE("unique_sku")
);
--> statement-breakpoint
ALTER TABLE "discount_items" ADD CONSTRAINT "discount_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_discount_items_product_status" ON "discount_items" USING btree ("product_id","status");--> statement-breakpoint
CREATE INDEX "idx_discount_items_reserved" ON "discount_items" USING btree ("status","reserved_at");