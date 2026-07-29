CREATE TYPE "public"."media_type" AS ENUM('image', 'user_instruction', 'service_instruction', 'certificate');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."slide_placement" AS ENUM('home_hero', 'catalog_hero');--> statement-breakpoint
CREATE TYPE "public"."slide_type" AS ENUM('promo_product', 'promo_information');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title_ru" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"internal_title" text NOT NULL,
	"placement" "slide_placement" DEFAULT 'home_hero' NOT NULL,
	"bucket_name" text DEFAULT 'system-assets' NOT NULL,
	"file_key" text NOT NULL,
	"mobile_file_key" text,
	"type" "slide_type" NOT NULL,
	"payload" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"site_article" text NOT NULL,
	"item_article" text NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"is_latest" boolean DEFAULT false NOT NULL,
	"color_name" text,
	"manual_price" integer,
	"manual_stock" integer,
	"discount_percentage" integer DEFAULT 0 NOT NULL,
	"ozon_link" text,
	"ozon_stock_fbo" integer,
	"wb_link" text,
	"fbs_stock" integer,
	"wb_chrt_id" integer,
	"wb_discounted_price" integer,
	"ymarket_link" text,
	"mvideo_link" text,
	"weight_netto" integer,
	"weight_brutto" integer,
	"filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"specifications" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_item_article_unique" UNIQUE("item_article")
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"bucket_name" text DEFAULT 'products' NOT NULL,
	"file_key" text NOT NULL,
	"image_fit" text DEFAULT 'contain' NOT NULL,
	"mime_type" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_title_trgm" ON "categories" USING gin ("title_ru" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_products_filters" ON "products" USING gin ("filters");--> statement-breakpoint
CREATE INDEX "idx_products_article_trgm" ON "products" USING gin ("item_article" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_product_media_product_type_sort" ON "product_media" USING btree ("product_id","type","sort_order");