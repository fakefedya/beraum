import "server-only";

import { cache } from "react";
import { db } from "@/src/server/db/client";
import { discountItems } from "@/src/server/db/schema/discount.schema";
import { products, categories, productDocuments } from "@/src/server/db/schema";
import { eq, and, desc, count, asc, or, ilike, type SQL } from "drizzle-orm";
import { buildImageUrl } from "@/src/lib/utils";
import { unstable_cache } from "next/cache";

export async function getPublicDiscountItems(
  params: {
    categoryId?: string;
    limit?: number;
    offset?: number;
    sort?: "newest" | "price_asc" | "price_desc";
    q?: string;
  } = {},
) {
  try {
    const { limit = 20, offset = 0, categoryId, sort = "newest", q } = params;

    const filters: (SQL | undefined)[] = [
      eq(discountItems.status, "available"),
    ];

    if (categoryId && categoryId !== "all") {
      filters.push(eq(products.categoryId, categoryId));
    }

    if (q && q.trim().length > 0) {
      const safeQuery = q.trim().replace(/[%_]/g, "\\$&");
      const searchTerm = `%${safeQuery}%`;

      filters.push(
        or(
          ilike(discountItems.uniqueSku, searchTerm),
          ilike(products.siteArticle, searchTerm),
          ilike(products.itemArticle, searchTerm),
          ilike(categories.titleRu, searchTerm),
        ),
      );
    }

    const finalCondition = and(...filters);

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
        .innerJoin(categories, eq(products.categoryId, categories.id))
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

export const getDiscountCategories = unstable_cache(
  async () => {
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
    } catch {
      return { success: false, data: [] };
    }
  },
  ["discount-categories-list"],
  { revalidate: 3600, tags: ["discount_items", "categories"] },
);

export const getDiscountItemBySku = cache(async (uniqueSku: string) => {
  try {
    const itemQuery = db
      .select({
        id: discountItems.id,
        uniqueSku: discountItems.uniqueSku,
        defectDescription: discountItems.defectDescription,
        discountPrice: discountItems.discountPrice,
        mediaKeys: discountItems.mediaKeys,
        status: discountItems.status,
        baseItemArticle: products.itemArticle,
        siteArticle: products.siteArticle,
        colorName: products.colorName,
        specifications: products.specifications,
        basePrice: products.manualPrice,
        categoryId: products.categoryId,
        categorySlug: categories.slug,
        categoryName: categories.titleRu,
      })
      .from(discountItems)
      .innerJoin(products, eq(discountItems.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(discountItems.uniqueSku, uniqueSku));

    const docsQuery = db
      .select({
        type: productDocuments.type,
        title: productDocuments.title,
        fileKey: productDocuments.fileKey,
        bucketName: productDocuments.bucketName,
      })
      .from(productDocuments)
      .innerJoin(products, eq(productDocuments.productId, products.id))
      .innerJoin(discountItems, eq(products.id, discountItems.productId))
      .where(eq(discountItems.uniqueSku, uniqueSku));

    const [[item], rawDocs] = await Promise.all([itemQuery, docsQuery]);

    if (!item) return { success: false, data: null };

    const documents = rawDocs.map((doc) => ({
      type: doc.type,
      title: doc.title,
      url: buildImageUrl({
        bucketName: doc.bucketName,
        fileKey: doc.fileKey,
      }),
    }));

    return { success: true, data: { ...item, documents } };
  } catch {
    return { success: false, data: null };
  }
});
