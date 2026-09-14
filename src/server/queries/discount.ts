import "server-only";

import { db } from "@/src/server/db/client";
import { discountItems } from "@/src/server/db/schema/discount.schema";
import { products, categories } from "@/src/server/db/schema";
import { eq, and, desc, count, asc } from "drizzle-orm";

export async function getPublicDiscountItems(
  params: {
    categoryId?: string;
    limit?: number;
    offset?: number;
    sort?: "newest" | "price_asc" | "price_desc";
  } = {},
) {
  try {
    const { limit = 20, offset = 0, categoryId, sort = "newest" } = params;

    const filters = [eq(discountItems.status, "available")];

    if (categoryId && categoryId !== "all") {
      filters.push(eq(products.categoryId, categoryId));
    }

    const finalCondition = and(...filters);

    // 🛡️ Безопасный маппинг сортировки
    let orderClause = desc(discountItems.createdAt);
    if (sort === "price_asc") {
      orderClause = asc(discountItems.discountPrice);
    } else if (sort === "price_desc") {
      orderClause = desc(discountItems.discountPrice);
    }

    const [items, [{ totalCount }]] = await Promise.all([
      db
        .select({
          id: discountItems.id,
          uniqueSku: discountItems.uniqueSku,
          defectDescription: discountItems.defectDescription,
          discountPrice: discountItems.discountPrice,
          mediaKeys: discountItems.mediaKeys,
          baseItemArticle: products.itemArticle,
          siteArticle: products.siteArticle,
          categoryName: categories.titleRu,
          categoryId: categories.id,
          colorName: products.colorName,
          basePrice: products.manualPrice,
        })
        .from(discountItems)
        .innerJoin(products, eq(discountItems.productId, products.id))
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(finalCondition)
        .orderBy(orderClause)
        .limit(limit)
        .offset(offset),
      db
        .select({ totalCount: count() })
        .from(discountItems)
        .innerJoin(products, eq(discountItems.productId, products.id))
        .where(finalCondition),
    ]);

    return {
      success: true,
      data: items,
      totalCount,
      hasMore: offset + limit < totalCount,
    };
  } catch (error) {
    console.error("❌ Ошибка getPublicDiscountItems:", error);
    return { success: false, data: [], totalCount: 0, hasMore: false };
  }
}

export async function getDiscountCategories() {
  try {
    const activeCategories = await db
      .select({
        id: categories.id,
        name: categories.titleRu,
        slug: categories.slug,
        itemsCount: count(discountItems.id),
      })
      .from(categories)
      .innerJoin(products, eq(categories.id, products.categoryId))
      .innerJoin(discountItems, eq(products.id, discountItems.productId))
      .where(eq(discountItems.status, "available"))
      .groupBy(categories.id)
      .orderBy(categories.titleRu);

    return { success: true, data: activeCategories };
  } catch (error) {
    console.error("❌ Ошибка getDiscountCategories:", error);
    return { success: false, data: [] };
  }
}

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
        specifications: products.specifications,
        basePrice: products.manualPrice,

        // Данные для навигации и похожих товаров
        categoryId: products.categoryId,
        categorySlug: categories.slug,
        categoryName: categories.titleRu,
      })
      .from(discountItems)
      .innerJoin(products, eq(discountItems.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(discountItems.uniqueSku, uniqueSku));

    if (!item) return { success: false, data: null };

    return { success: true, data: item };
  } catch (error) {
    console.error("❌ Ошибка getDiscountItemBySku:", error);
    return { success: false, data: null };
  }
}
