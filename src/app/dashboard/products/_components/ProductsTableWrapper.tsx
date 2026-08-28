import { db } from "@/src/server/db/client";
import { products, categories } from "@/src/server/db/schema";
import { count, desc, or, ilike, eq, and } from "drizzle-orm";
import { ProductsTable } from "./ProductsTable";
import { CatalogPagination } from "@/src/app/(store)/catalog/[category]/_components/CatalogPagination";

const LIMIT = 25;

interface WrapperProps {
  query: string;
  status: string;
  page: number;
}

export const ProductsTableWrapper = async ({
  query,
  status,
  page,
}: WrapperProps) => {
  const offset = (page - 1) * LIMIT;
  const filters = [];

  if (status !== "all") {
    filters.push(
      eq(products.status, status as "published" | "draft" | "archived"),
    );
  }

  if (query) {
    filters.push(
      or(
        ilike(products.itemArticle, `%${query}%`),
        ilike(products.siteArticle, `%${query}%`),
        ilike(categories.titleRu, `%${query}%`),
      ),
    );
  }

  const finalCondition = filters.length > 0 ? and(...filters) : undefined;

  const [rawData, [{ totalCount }]] = await Promise.all([
    db
      .select({ product: products, categoryTitle: categories.titleRu })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(finalCondition)
      .orderBy(desc(products.createdAt))
      .limit(LIMIT)
      .offset(offset),
    db
      .select({ totalCount: count() })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(finalCondition),
  ]);

  const hasMore = offset + LIMIT < totalCount;
  const flatData = rawData.map((row) => ({
    ...row.product,
    categoryTitle: row.categoryTitle,
  }));

  return (
    <div className="animate-in fade-in flex flex-col gap-4 duration-500">
      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <ProductsTable initialData={flatData} />
        </div>
      </div>

      <div className="py-4">
        <CatalogPagination currentPage={page} hasMore={hasMore} />
      </div>
    </div>
  );
};
