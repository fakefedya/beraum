import "server-only";
import { db } from "@/src/server/db/client";
import { discountItems } from "@/src/server/db/schema/discount.schema";
import { products, categories } from "@/src/server/db/schema";
import { desc, count, eq } from "drizzle-orm";

export async function getAdminDiscountItems(page = 1, limit = 25) {
  const offset = (page - 1) * limit;

  const [data, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id: discountItems.id,
        uniqueSku: discountItems.uniqueSku,
        defectDescription: discountItems.defectDescription,
        discountPrice: discountItems.discountPrice,
        status: discountItems.status,
        reservedAt: discountItems.reservedAt,
        baseArticle: products.itemArticle,
        categoryName: categories.titleRu,
      })
      .from(discountItems)
      .innerJoin(products, eq(discountItems.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(discountItems.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ totalCount: count() }).from(discountItems),
  ]);

  return { data, totalCount, hasMore: offset + limit < totalCount };
}
