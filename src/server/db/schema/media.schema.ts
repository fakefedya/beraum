import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { documentTypeEnum } from "./enums.schema";
import { products } from "./products.schema";

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    bucketName: text("bucket_name").notNull().default("products"),
    fileKey: text("file_key").notNull(),
    imageFit: text("image_fit", { enum: ["contain", "cover"] })
      .default("contain")
      .notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isCover: boolean("is_cover").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    productSortIdx: index("idx_product_images_sort").on(
      table.productId,
      table.sortOrder,
    ),
    uniqueCoverIdx: uniqueIndex("idx_product_unique_cover")
      .on(table.productId)
      .where(sql`${table.isCover} = true`),
  }),
);

export const productDocuments = pgTable(
  "product_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    type: documentTypeEnum("type").notNull(),
    title: text("title").notNull(),
    bucketName: text("bucket_name").notNull().default("products"),
    fileKey: text("file_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    productDocIdx: index("idx_product_docs").on(table.productId, table.type),
  }),
);
