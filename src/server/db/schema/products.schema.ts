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
import { productStatusEnum } from "./enums.schema";
import { categories } from "./categories.schema";

export type ProductFilters = Record<string, string | number | boolean | null>;
export type ProductSpecifications = Record<string, string | number | null>;

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "restrict",
    }),

    siteArticle: text("site_article").notNull(),
    itemArticle: text("item_article").notNull().unique(),
    status: productStatusEnum("status").default("draft").notNull(),
    isLatest: boolean("is_latest").default(false).notNull(),
    colorName: text("color_name"),

    basePrice: integer("base_price").notNull().default(0),
    baseStock: integer("base_stock").notNull().default(0),
    manualPrice: integer("manual_price"),
    manualStock: integer("manual_stock"),

    ozonLink: text("ozon_link"),
    ozonStockFbo: integer("ozon_stock_fbo"),

    wbLink: text("wb_link"),
    fbsStock: integer("fbs_stock"),
    wbChrtId: integer("wb_chrt_id"),

    weightNetto: integer("weight_netto"),
    weightBrutto: integer("weight_brutto"),

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
      filtersIdx: index("idx_products_filters").using("gin", table.filters),
    };
  },
);
