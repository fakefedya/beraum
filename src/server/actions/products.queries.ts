"use server";

import { z } from "zod";
import { eq, desc, asc, and, sql, or, ilike } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { products, categories } from "@/src/server/db/schema"; // Читаем из index.ts
import { CATEGORY_FILTERS } from "@/src/lib/constants";

const filterValueSchema = z.union([z.string(), z.array(z.string())]);

const getProductsSchema = z.object({
  categorySlug: z.string().min(1).max(100).optional(),
  limit: z.number().int().min(1).max(50).default(12), // Защита от DDoS
  offset: z.number().int().min(0).default(0),
  filters: z.record(z.string(), filterValueSchema).optional(),
  sort: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val[0] : val))
    .pipe(z.enum(["newest", "price_asc", "price_desc"]).catch("newest"))
    .default("newest"),
});

const getProductByArticleSchema = z.object({
  article: z.string().min(1).max(50).trim(),
});

export type GetProductsParams = z.input<typeof getProductsSchema>;
export type CatalogProduct = Awaited<ReturnType<typeof getProducts>>["data"][0];

const computedPriceSql = sql<number>`COALESCE(
  NULLIF(${products.wbDiscountedPrice}, 0), -- Приоритет 1: Цена WB
  NULLIF(${products.manualPrice}, 0),       -- Приоритет 2: Ручная цена
  0                                         -- Приоритет 3: Дефолт
)`;

const productTypeSql = sql<string>`MAX(
  CASE 
    WHEN ${products.filters}->>'type' IS NOT NULL 
    THEN (${products.filters}->>'type') || ' ' || LOWER(${categories.titleRu})
    ELSE ${categories.titleRu}
  END
)`;

export async function getProducts(params: GetProductsParams = {}) {
  try {
    const { limit, offset, categorySlug, filters, sort } =
      getProductsSchema.parse(params);
    const conditions = [eq(products.status, "published")];
    const orderConditions = [];

    if (sort === "price_asc") {
      orderConditions.push(asc(sql`MIN(${computedPriceSql})`));
    } else if (sort === "price_desc") {
      orderConditions.push(desc(sql`MIN(${computedPriceSql})`));
    } else {
      orderConditions.push(desc(sql`BOOL_OR(${products.isLatest})`));
      orderConditions.push(desc(sql`MAX(${products.createdAt})`));
    }

    if (categorySlug) {
      const [category] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);

      if (!category)
        return { success: false, error: "Категория не найдена", data: [] };
      conditions.push(eq(products.categoryId, category.id));
    }

    if (filters && categorySlug && CATEGORY_FILTERS[categorySlug]) {
      const allowedFilters = CATEGORY_FILTERS[categorySlug];

      for (const [key, value] of Object.entries(filters)) {
        const filterConfig = allowedFilters.find((f) => f.key === key);
        if (!filterConfig) continue;

        const valuesArray = Array.isArray(value) ? value : [value];

        if (valuesArray.length > 0) {
          const orConditions = valuesArray.map(
            (val) => sql`${products.filters}->>${key} = ${val}`,
          );

          const orClause = or(...orConditions);
          if (orClause) {
            conditions.push(orClause);
          }
        }
      }
    }

    const items = await db
      .select({
        siteArticle: products.siteArticle,
        categorySlug: categories.slug,
        categoryTitle: categories.titleRu,
        productType: productTypeSql,

        variants: sql<
          {
            id: string;
            itemArticle: string;
            colorName: string | null;
            price: number;
            stock: number;
            isLatest: boolean;
          }[]
        >`jsonb_agg(
  jsonb_build_object(
    'id', ${products.id},
    'itemArticle', ${products.itemArticle},
    'colorName', ${products.colorName},
    'isLatest', COALESCE(${products.isLatest}, false),
    'price', ${computedPriceSql},
    'stock', (
      COALESCE(${products.ozonStockFbo}, 0) + 
      COALESCE(${products.fbsStock}, 0)
    )
  )
    ORDER BY ${products.itemArticle} ASC
)`.as("variants"),
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .groupBy(products.siteArticle, categories.slug, categories.titleRu)
      .orderBy(...orderConditions)
      .limit(limit)
      .offset(offset);

    return { success: true, data: items };
  } catch (error) {
    console.error("❌ Ошибка Server Action (getProducts):", error);
    return { success: false, error: "Ошибка при загрузке каталога", data: [] };
  }
}

export async function getProductByArticle(rawArticle: string) {
  try {
    const { article } = getProductByArticleSchema.parse({
      article: rawArticle,
    });

    const [product] = await db
      .select({
        id: products.id,
        siteArticle: products.siteArticle,
        itemArticle: products.itemArticle,
        colorName: products.colorName,
        categoryTitle: categories.titleRu,
        isLatest: products.isLatest,
        specifications: products.specifications,
        price: computedPriceSql.as("price"),
        ozonLink: products.ozonLink,
        ozonStockFbo: products.ozonStockFbo,
        wbLink: products.wbLink,
        ymarketLink: products.ymarketLink,
        mvideoLink: products.mvideoLink,
        fbsStock: products.fbsStock,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.status, "published"),
          ilike(products.itemArticle, article),
        ),
      )
      .limit(1);

    if (!product) return { success: false, error: "Товар не найден" };

    const variants = await db
      .select({
        id: products.id,
        itemArticle: products.itemArticle,
        colorName: products.colorName,
        ozonStockFbo: products.ozonStockFbo,
        fbsStock: products.fbsStock,
        manualStock: products.manualStock,
      })
      .from(products)
      .where(
        and(
          eq(products.status, "published"),
          eq(products.siteArticle, product.siteArticle),
        ),
      )
      .orderBy(products.itemArticle);

    return { success: true, data: { ...product, variants } };
  } catch (error) {
    console.error("❌ Ошибка Server Action (getProductByArticle):", error);
    return { success: false, error: "Недопустимый запрос" };
  }
}
