import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// === СТРОГИЕ ТИПЫ ДЛЯ JSONB ===
export type ProductFilters = Record<string, string | number | boolean | null>;
export type ProductSpecifications = Record<string, string | number | null>;

// === ЭНУМЫ ===
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "archived",
]);
export const mediaTypeEnum = pgEnum("media_type", [
  "image",
  "instruction",
  "certificate",
]);

// === КАТЕГОРИИ ===
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(), // Например: 'hob', 'hood', 'oven'
  titleRu: text("title_ru").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// === ТОВАРЫ (Главная таблица) ===
export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "restrict",
    }),

    // Идентификаторы
    siteArticle: text("site_article").notNull().unique(),
    itemArticle: text("item_article").notNull().unique(),

    // Статусы
    status: productStatusEnum("status").default("draft").notNull(),
    isLatest: boolean("is_latest").default(false).notNull(),

    // === БАЗОВЫЕ ДАННЫЕ ===
    basePrice: integer("base_price").notNull().default(0),
    baseStock: integer("base_stock").notNull().default(0),

    // === РУЧНОЕ ПЕРЕОПРЕДЕЛЕНИЕ (Дашборд) ===
    manualPrice: integer("manual_price"),
    manualStock: integer("manual_stock"),

    // === ИНТЕГРАЦИИ (OZON & WB) ===
    ozonLink: text("ozon_link"),
    ozonPrice: integer("ozon_price"),
    ozonStock: integer("ozon_stock"),

    wbLink: text("wb_link"),
    wbPrice: integer("wb_price"),
    wbStock: integer("wb_stock"),

    // === ЛОГИСТИКА ===
    // Храним строго в граммах во избежание проблем с плавающей точкой
    weightNetto: integer("weight_netto"),
    weightBrutto: integer("weight_brutto"),

    // === ГИБКИЕ ДАННЫЕ (E-commerce паттерн с типизацией) ===
    filters: jsonb("filters").$type<ProductFilters>().default({}).notNull(),
    specifications: jsonb("specifications")
      .$type<ProductSpecifications>()
      .default({})
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // GIN индекс для высокоскоростного поиска по фильтрам (jsonb)
      filtersIdx: index("idx_products_filters").using("gin", table.filters),
    };
  },
);

// === МЕДИА-ФАЙЛЫ (Интеграция с MinIO) ===
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

export const slideTypeEnum = pgEnum("slide_type", [
  "product_tags",
  "promo_card",
]);

// TypeScript типы для разработки
export type SlideTagItem = {
  xPercent: number;
  yPercent: number;
  title: string;
  subtitle: string;
  href: string;
};

export type SlidePayload =
  | { tags: SlideTagItem[] }
  | { title: string; description: string; buttonText: string; href: string };

export const heroSlides = pgTable("hero_slides", {
  id: uuid("id").defaultRandom().primaryKey(),
  internalTitle: text("internal_title").notNull(),
  bucketName: text("bucket_name").notNull().default("system-assets"),
  fileKey: text("file_key").notNull(),
  type: slideTypeEnum("type").notNull(),

  payload: jsonb("payload").$type<SlidePayload>().notNull(),

  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
