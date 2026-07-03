"use server";

import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { products, categories } from "@/src/server/db/schema";

const getProductsSchema = z.object({
  categorySlug: z.string().min(1).max(100).optional(),
  limit: z.number().int().min(1).max(50).default(12),
  offset: z.number().int().min(0).default(0),
});

export type GetProductsParams = z.input<typeof getProductsSchema>;
export type CatalogProduct = Awaited<ReturnType<typeof getProducts>>["data"][0];

export async function getProducts(params: GetProductsParams = {}) {
  try {
    const { limit, offset, categorySlug } = getProductsSchema.parse(params);
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

    const items = await db
      .select({
        siteArticle: products.siteArticle,
        categorySlug: categories.slug,
        categoryTitle: categories.titleRu,

        // Магия PostgreSQL: Собираем все артикулы-цвета в массив
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
