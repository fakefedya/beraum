ALTER TABLE "marketplace_clicks" ADD COLUMN "source" text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "marketplace_clicks" ADD COLUMN "device_type" text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_clicks_article_date" ON "marketplace_clicks" USING btree ("article","created_at");