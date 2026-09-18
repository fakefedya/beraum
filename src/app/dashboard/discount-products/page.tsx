import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import { getCategoriesList } from "@/src/server/queries/categories";
import { DiscountItemsTableWrapper } from "./_components/DiscountItemsTableWrapper";
import { CreateDiscountItemSheet } from "./_components/CreateDiscountItemSheet";
import { SearchInput } from "@/src/components/shared/SearchInput";
import { requireAuthRole } from "@/src/server/utils/auth-check";
import { cn } from "@/src/lib/utils";

export const metadata: Metadata = {
  title: "Дисконт товары",
};

const STATUS_FILTERS = [
  { label: "Все", value: "all" },
  { label: "Доступны", value: "available" },
  { label: "Бронь", value: "reserved" },
  { label: "Проданы", value: "sold" },
];

const searchParamsSchema = z.object({
  page: z.coerce.number().min(1).max(100).catch(1),
  category: z.string().uuid().or(z.literal("all")).catch("all"),
  sort: z.enum(["newest", "price_asc", "price_desc"]).catch("newest"),
  q: z.string().max(100).catch("").default(""),
  status: z.enum(["all", "available", "reserved", "sold"]).catch("all"),
});

export default async function DiscountItemsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    await requireAuthRole([
      "superadmin",
      "admin",
      "manager",
      "support",
      "warehouse",
    ]);
  } catch {
    redirect("/dashboard");
  }

  const rawParams = await props.searchParams;
  const {
    page: currentPage,
    q: query,
    status: currentStatus,
  } = searchParamsSchema.parse(rawParams);

  const { data: categories } = await getCategoriesList();

  const createFilterUrl = (statusVal: string) => {
    const params = new URLSearchParams();
    if (statusVal !== "all") params.set("status", statusVal);
    if (query) params.set("q", query);
    const str = params.toString();
    return `/dashboard/discount-products${str ? `?${str}` : ""}`;
  };

  const suspenseKey = `${query}-${currentStatus}-${currentPage}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Дисконт товары
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            paramName="q"
            placeholder="Поиск по SKU или описанию..."
          />
          <CreateDiscountItemSheet categories={categories || []} />
        </div>
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
        <DiscountItemsTableWrapper
          page={currentPage}
          query={query}
          status={currentStatus}
        />
      </Suspense>
    </div>
  );
}
