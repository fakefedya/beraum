import "server-only";
import { db } from "@/src/server/db/client";
import { discountItems } from "@/src/server/db/schema/discount.schema";
import { products, categories } from "@/src/server/db/schema";
import { desc, count, eq, ilike, or, and, type SQL } from "drizzle-orm";

export async function getAdminDiscountItems(page = 1, query = "", limit = 25) {
  const offset = (page - 1) * limit;

  const filters: (SQL | undefined)[] = [];

  if (query) {
    const searchTerm = `%${query.trim()}%`;
    filters.push(
      or(
        ilike(discountItems.uniqueSku, searchTerm),
        ilike(discountItems.defectDescription, searchTerm),
        ilike(products.itemArticle, searchTerm),
      ),
    );
  }

  const finalCondition = filters.length > 0 ? and(...filters) : undefined;

  const [data, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id: discountItems.id,
        uniqueSku: discountItems.uniqueSku,
        defectDescription: discountItems.defectDescription,
        discountPrice: discountItems.discountPrice,
        status: discountItems.status,
        reservedAt: discountItems.reservedAt,
        mediaKeys: discountItems.mediaKeys,
        baseArticle: products.itemArticle,
        categoryName: categories.titleRu,
      })
      .from(discountItems)
      .innerJoin(products, eq(discountItems.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(finalCondition)
      .orderBy(desc(discountItems.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ totalCount: count() })
      .from(discountItems)
      .innerJoin(products, eq(discountItems.productId, products.id))
      .where(finalCondition),
  ]);

  return { data, totalCount, hasMore: offset + limit < totalCount };
}
