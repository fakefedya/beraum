CREATE TYPE "public"."media_type" AS ENUM('image', 'instruction', 'certificate');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title_ru" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"bucket_name" text DEFAULT 'products' NOT NULL,
	"file_key" text NOT NULL,
	"mime_type" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"site_article" text NOT NULL,
	"item_article" text NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"is_latest" boolean DEFAULT false NOT NULL,
	"base_price" integer DEFAULT 0 NOT NULL,
	"base_stock" integer DEFAULT 0 NOT NULL,
	"manual_price" integer,
	"manual_stock" integer,
	"ozon_link" text,
	"ozon_price" integer,
	"ozon_stock" integer,
	"wb_link" text,
	"wb_price" integer,
	"wb_stock" integer,
	"weight_netto" integer,
	"weight_brutto" integer,
	"filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"specifications" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_site_article_unique" UNIQUE("site_article"),
	CONSTRAINT "products_item_article_unique" UNIQUE("item_article")
);
--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_products_filters" ON "products" USING gin ("filters");