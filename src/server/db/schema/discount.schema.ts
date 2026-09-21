import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm"; // <-- Добавлен импорт sql
import { discountItemStatusEnum } from "./enums.schema";
import { products } from "./products.schema";

export type DiscountMedia = {
  key: string;
  isCover: boolean;
  fit: "contain" | "cover";
};

export const discountItems = pgTable(
  "discount_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),

    uniqueSku: text("unique_sku").notNull().unique(),
    defectDescription: text("defect_description").notNull(),
    productState: text("product_state"),
    productDescription: text("product_description"),
    discountPrice: integer("discount_price").notNull(),

    mediaKeys: jsonb("media_keys")
      .$type<DiscountMedia[]>()
      .default([])
      .notNull(),

    status: discountItemStatusEnum("status").default("available").notNull(),
    reservedAt: timestamp("reserved_at", { withTimezone: true, mode: "date" }),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_discount_items_product_status").on(
      table.productId,
      table.status,
    ),
    index("idx_discount_items_reserved").on(table.status, table.reservedAt),
    index("idx_discount_items_sku_trgm").using(
      "gin",
      sql`${table.uniqueSku} gin_trgm_ops`,
    ),
  ],
);
