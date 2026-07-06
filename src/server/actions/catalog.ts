"use server";

import { z } from "zod";
import { eq, desc, and, sql, or } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { products, categories } from "@/src/server/db/schema";
import { CATEGORY_FILTERS } from "@/src/lib/constants"; // Подключаем белый список фильтров

// Zero trust ZOD валидация
const filterValueSchema = z.union([z.string(), z.array(z.string())]);

const getProductsSchema = z.object({
  categorySlug: z.string().min(1).max(100).optional(),
  limit: z.number().int().min(1).max(50).default(12), // Защита от DDoS
  offset: z.number().int().min(0).default(0),
  filters: z.record(z.string(), filterValueSchema).optional(),
});

export type GetProductsParams = z.input<typeof getProductsSchema>;
export type CatalogProduct = Awaited<ReturnType<typeof getProducts>>["data"][0];

export async function getProducts(params: GetProductsParams = {}) {
  try {
    const { limit, offset, categorySlug, filters } =
      getProductsSchema.parse(params);
    const conditions = [eq(products.status, "published")];

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

    // === БЕЗОПАСНАЯ ФИЛЬТРАЦИЯ И РЕШЕНИЕ ОШИБКИ TS ===
    if (filters && categorySlug && CATEGORY_FILTERS[categorySlug]) {
      const allowedFilters = CATEGORY_FILTERS[categorySlug];

      for (const [key, value] of Object.entries(filters)) {
        // ИБ: Проверяем, есть ли присланный ключ в нашем конфиге для этой категории
        const filterConfig = allowedFilters.find((f) => f.key === key);
        if (!filterConfig) continue;

        // Приводим все к массиву для унификации логики
        const valuesArray = Array.isArray(value) ? value : [value];

        if (valuesArray.length > 0) {
          const orConditions = valuesArray.map(
            (val) => sql`${products.filters}->>${key} = ${val}`,
          );

          // Явная проверка на undefined удовлетворяет строгую типизацию TypeScript
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

        variants: sql<
          {
            id: string;
            itemArticle: string;
            colorName: string | null;
            price: number;
            stock: number;
          }[]
        >`jsonb_agg(
          jsonb_build_object(
            'id', ${products.id},
            'itemArticle', ${products.itemArticle},
            'colorName', ${products.colorName},
            'price', COALESCE(${products.manualPrice}, ${products.basePrice}),
            'stock', COALESCE(${products.manualStock}, ${products.baseStock})
          )
        )`.as("variants"),
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .groupBy(products.siteArticle, categories.slug, categories.titleRu)
      .orderBy(desc(sql`MAX(${products.createdAt})`))
      .limit(limit)
      .offset(offset);

    return { success: true, data: items };
  } catch (error) {
    console.error("❌ Ошибка Server Action (getProducts):", error);
    return { success: false, error: "Ошибка при загрузке каталога", data: [] };
  }
}
