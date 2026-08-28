import { Metadata } from "next";
import { db } from "@/src/server/db/client";
import { products, categories } from "@/src/server/db/schema";
import { auth } from "@/src/lib/auth/auth";
import { redirect } from "next/navigation";
import { count, desc, or, ilike, eq, and } from "drizzle-orm";
import { ProductsTable } from "./_components/ProductsTable";
import { CatalogPagination } from "@/src/app/(store)/catalog/[category]/_components/CatalogPagination";
import { ProductsSearch } from "./_components/ProductsSearch";
import Link from "next/link";
import { CreateProductSheet } from "./_components/CreateProductSheet"; // 👈 Импорт
import { getCategoriesList } from "@/src/server/queries/categories"; // 👈 Импорт

import { cn } from "@/src/lib/utils";

export const metadata: Metadata = {
  title: "Управление товарами — Beraum Admin",
};

const LIMIT = 25;

const STATUS_FILTERS = [
  { label: "Все", value: "all" },
  { label: "Опубликованы", value: "published" },
  { label: "Черновики", value: "draft" },
  { label: "Архив", value: "archived" },
];

export default async function AdminProductsPage(props: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const session = await auth();
  if (
    !session?.user ||
    !["superadmin", "manager"].includes(session.user.role)
  ) {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  const pageStr = searchParams.page;
  const currentPage =
    typeof pageStr === "string" ? Math.max(parseInt(pageStr, 10) || 1, 1) : 1;
  const offset = (currentPage - 1) * LIMIT;
  const query = searchParams.q?.trim() || "";
  const currentStatus = searchParams.status || "all";

  // Динамическая сборка фильтров
  const filters = [];

  if (currentStatus !== "all") {
    filters.push(
      eq(products.status, currentStatus as "published" | "draft" | "archived"),
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

  const [rawData, [{ totalCount }], { data: categoriesData }] =
    await Promise.all([
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
      getCategoriesList(), // 👈 Вызов слоя абстракции
    ]);

  const hasMore = offset + LIMIT < totalCount;
  const flatData = rawData.map((row) => ({
    ...row.product,
    categoryTitle: row.categoryTitle,
  }));

  const createFilterUrl = (statusVal: string) => {
    const params = new URLSearchParams();
    if (statusVal !== "all") params.set("status", statusVal);
    if (query) params.set("q", query);
    const str = params.toString();
    return `/dashboard/products${str ? `?${str}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Товары</h1>
        <ProductsSearch />
        <CreateProductSheet categories={categoriesData || []} />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={createFilterUrl(f.value)}
            className={cn(
              "focus-visible:ring-ring rounded-full px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2",
              currentStatus === f.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <ProductsTable initialData={flatData} />
        </div>
      </div>

      <div className="py-4">
        <CatalogPagination currentPage={currentPage} hasMore={hasMore} />
      </div>
    </div>
  );
}
