CREATE TABLE "marketplace_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article" text NOT NULL,
	"marketplace" text NOT NULL,
	"device_id" uuid NOT NULL,
	"ip_hash" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_clicks_article" ON "marketplace_clicks" USING btree ("article");--> statement-breakpoint
CREATE INDEX "idx_clicks_marketplace" ON "marketplace_clicks" USING btree ("marketplace");--> statement-breakpoint
CREATE INDEX "idx_clicks_device_id" ON "marketplace_clicks" USING btree ("device_id");