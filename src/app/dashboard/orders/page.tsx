import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import { requireAuthRole } from "@/src/server/utils/auth-check";
import { cn } from "@/src/lib/utils";
import { SearchInput } from "@/src/components/shared/SearchInput";
import { OrdersTableWrapper } from "./_components/OrdersTableWrapper";

export const metadata: Metadata = { title: "Заказы дисконта" };

const STATUS_FILTERS = [
  { label: "Все", value: "all" },
  { label: "Новые", value: "new" },
  { label: "В работе", value: "processing" },
  { label: "Завершены", value: "completed" },
  { label: "Отменены", value: "cancelled" },
];

const searchParamsSchema = z.object({
  page: z.coerce.number().min(1).catch(1),
  q: z.string().catch("").default(""),
  status: z
    .enum(["all", "new", "processing", "completed", "cancelled"])
    .catch("all"),
});

export default async function OrdersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    await requireAuthRole(["superadmin", "admin", "manager"]);
  } catch {
    redirect("/dashboard");
  }
  const rawParams = await props.searchParams;
  const {
    page: currentPage,
    q: query,
    status: currentStatus,
  } = searchParamsSchema.parse(rawParams);

  const createFilterUrl = (statusVal: string) => {
    const params = new URLSearchParams();
    if (statusVal !== "all") params.set("status", statusVal);
    if (query) params.set("q", query);
    const str = params.toString();
    return `/dashboard/orders${str ? `?${str}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Заказы дисконта
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Обработка покупок из корзины дисконта
          </p>
        </div>
        <SearchInput paramName="q" placeholder="Номер, email или телефон..." />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={createFilterUrl(f.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2",
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
        key={`${query}-${currentStatus}-${currentPage}`}
        fallback={
          <div className="bg-card flex h-64 w-full items-center justify-center rounded-xl border">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        }
      >
        <OrdersTableWrapper
          page={currentPage}
          query={query}
          status={currentStatus}
        />
      </Suspense>
    </div>
  );
}
