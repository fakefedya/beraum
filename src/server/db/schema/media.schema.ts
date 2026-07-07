import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { mediaTypeEnum } from "./enums.schema";
import { products } from "./products.schema";

export const productMedia = pgTable("product_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  type: mediaTypeEnum("type").notNull(),
  bucketName: text("bucket_name").notNull().default("products"),
  fileKey: text("file_key").notNull(),
  mimeType: text("mime_type"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
