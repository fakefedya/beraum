import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
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
    discountPrice: integer("discount_price").notNull(),

    // Массив ключей файлов из S3 (MinIO)
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
    // Индекс для быстрой проверки наличия дисконта на странице основного товара
    index("idx_discount_items_product_status").on(
      table.productId,
      table.status,
    ),
    // Индекс для фонового Cron-job, сбрасывающего зависшие резервы
    index("idx_discount_items_reserved").on(table.status, table.reservedAt),
  ],
);
