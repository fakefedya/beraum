import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { productStatusEnum, mediaTypeEnum } from "./enums";

// JSONB
export type ProductFilters = Record<string, string | number | boolean | null>;
export type ProductSpecifications = Record<string, string | number | null>;

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  titleRu: text("title_ru").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable(
  "products",
  {
    // UUID
    id: uuid("id").defaultRandom().primaryKey(),
    // Foreign Key с защитой. onDelete: "restrict" не даст удалить категорию, если в ней есть товары. База выдаст ошибку.
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "restrict",
    }),

    // Идентификаторы
    siteArticle: text("site_article").notNull(),
    itemArticle: text("item_article").notNull().unique(), // Уникальный

    // Статусы
    status: productStatusEnum("status").default("draft").notNull(),
    isLatest: boolean("is_latest").default(false).notNull(),

    // Базовые статусы
    basePrice: integer("base_price").notNull().default(0),
    baseStock: integer("base_stock").notNull().default(0),

    // Ручное переопределение
    manualPrice: integer("manual_price"),
    manualStock: integer("manual_stock"),

    // Маркетплейсы
    ozonLink: text("ozon_link"),
    ozonPrice: integer("ozon_price"),
    ozonStock: integer("ozon_stock"),

    wbLink: text("wb_link"),
    wbPrice: integer("wb_price"),
    wbStock: integer("wb_stock"),

    // Цвет
    colorName: text("color_name"),

    // Веса (граммы)
    weightNetto: integer("weight_netto"),
    weightBrutto: integer("weight_brutto"),

    // Фильтры и спецификация
    filters: jsonb("filters").$type<ProductFilters>().default({}).notNull(),
    specifications: jsonb("specifications")
      .$type<ProductSpecifications>()
      .default({})
      .notNull(),

    // Отметки времени
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // GIN индекс
      filtersIdx: index("idx_products_filters").using("gin", table.filters),
    };
  },
);

export const productMedia = pgTable("product_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  type: mediaTypeEnum("type").notNull(),
  bucketName: text("bucket_name").notNull().default("products"),
  fileKey: text("file_key").notNull(), // Например: 'products/UUID/images/photo.webp'

  mimeType: text("mime_type"),
  sortOrder: integer("sort_order").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
