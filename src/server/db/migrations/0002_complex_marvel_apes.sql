ALTER TABLE "marketplace_clicks" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "marketplace_clicks" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "slides" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "slides" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "slides" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "slides" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "product_media" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "product_media" ALTER COLUMN "created_at" SET DEFAULT now();