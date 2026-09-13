import "server-only";

import { db } from "@/src/server/db/client";
import { discountItems } from "@/src/server/db/schema/discount.schema";
import { products, categories } from "@/src/server/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function getPublicDiscountItems(limit = 20, offset = 0) {
  try {
    // 1. Выбираем только доступные товары
    const query = db
      .select({
        // Данные конкретного экземпляра
        id: discountItems.id,
        uniqueSku: discountItems.uniqueSku,
        defectDescription: discountItems.defectDescription,
        discountPrice: discountItems.discountPrice,
        mediaKeys: discountItems.mediaKeys,

        // Базовые данные из основного каталога
        baseItemArticle: products.itemArticle,
        siteArticle: products.siteArticle,
        categoryName: categories.titleRu,
        colorName: products.colorName,
        basePrice: products.manualPrice, // или wbDiscountedPrice, зависит от вашей бизнес-логики
      })
      .from(discountItems)
      .innerJoin(products, eq(discountItems.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(discountItems.status, "available"))
      .orderBy(desc(discountItems.createdAt))
      .limit(limit)
      .offset(offset);

    const items = await query;
    return { success: true, data: items };
  } catch (error) {
    console.error("❌ Ошибка getPublicDiscountItems:", error);
    return { success: false, data: [] };
  }
}

// Запрос для получения одного конкретного дисконт-товара по уникальному SKU
export async function getDiscountItemBySku(uniqueSku: string) {
  try {
    const [item] = await db
      .select({
        id: discountItems.id,
        uniqueSku: discountItems.uniqueSku,
        defectDescription: discountItems.defectDescription,
        discountPrice: discountItems.discountPrice,
        mediaKeys: discountItems.mediaKeys,
        status: discountItems.status,

        // Базовые данные
        baseItemArticle: products.itemArticle,
        siteArticle: products.siteArticle,
        colorName: products.colorName,
        specifications: products.specifications, // Характеристики берем из базы
      })
      .from(discountItems)
      .innerJoin(products, eq(discountItems.productId, products.id))
      .where(eq(discountItems.uniqueSku, uniqueSku));

    if (!item) return { success: false, data: null };

    return { success: true, data: item };
  } catch (error) {
    console.error("❌ Ошибка getDiscountItemBySku:", error);
    return { success: false, data: null };
  }
}
