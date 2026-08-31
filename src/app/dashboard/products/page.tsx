import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@/src/lib/auth/auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { getCategoriesList } from "@/src/server/queries/categories";
import { SearchInput } from "@/src/components/shared/SearchInput";
import { CreateProductSheet } from "./_components/CreateProductSheet";
import { ProductsTableWrapper } from "./_components/ProductsTableWrapper";

export const metadata: Metadata = {
  title: "Управление товарами — Beraum Admin",
};

const STATUS_FILTERS = [
  { label: "Все", value: "all" },
  { label: "Опубликованы", value: "published" },
  { label: "Черновики", value: "draft" },
  { label: "Архив", value: "archived" },
];

const searchParamsSchema = z.object({
  page: z.coerce.number().min(1).catch(1),
  q: z.string().trim().catch(""),
  status: z.enum(["all", "published", "draft", "archived"]).catch("all"),
});

export default async function AdminProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (
    !session?.user ||
    !["superadmin", "manager"].includes(session.user.role)
  ) {
    redirect("/dashboard");
  }

  const rawParams = await props.searchParams;
  const {
    page: currentPage,
    q: query,
    status: currentStatus,
  } = searchParamsSchema.parse(rawParams);

  const { data: categoriesData } = await getCategoriesList();

  const createFilterUrl = (statusVal: string) => {
    const params = new URLSearchParams();
    if (statusVal !== "all") params.set("status", statusVal);
    if (query) params.set("q", query);
    const str = params.toString();
    return `/dashboard/products${str ? `?${str}` : ""}`;
  };

  const suspenseKey = `${query}-${currentStatus}-${currentPage}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Товары</h1>
        <SearchInput
          paramName="q"
          placeholder="Поиск по артикулу или категории..."
        />
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

      <Suspense
        key={suspenseKey}
        fallback={
          <div className="bg-card flex h-64 w-full items-center justify-center rounded-xl border">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        }
      >
        <ProductsTableWrapper
          query={query}
          status={currentStatus}
          page={currentPage}
        />
      </Suspense>
    </div>
  );
}
