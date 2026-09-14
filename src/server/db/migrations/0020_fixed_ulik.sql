DROP INDEX "idx_products_site_article";--> statement-breakpoint
CREATE INDEX "idx_products_site_article_trgm" ON "products" USING gin ("site_article" gin_trgm_ops);