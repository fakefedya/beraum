import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";
import { auth } from "@/src/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { cn } from "@/src/lib/utils";
import { SearchInput } from "@/src/components/shared/SearchInput";
import { RequestsTableWrapper } from "./_components/RequestsTableWrapper";
import type { RequestType, RequestStatus } from "@/src/server/queries/requests";

export const metadata: Metadata = {
  title: "Заявки — Beraum Admin",
};

const TYPE_FILTERS: { label: string; value: RequestType }[] = [
  { label: "Все", value: "all" },
  { label: "Служба поддержки", value: "support" },
  { label: "Оптовые закупки", value: "wholesale" },
  { label: "B2B Партнерство", value: "partnership" },
  { label: "Консультации", value: "consultation" },
];

const STATUS_FILTERS: { label: string; value: RequestStatus }[] = [
  { label: "Любой статус", value: "all" },
  { label: "Новые", value: "new" },
  { label: "В работе", value: "in_progress" },
  { label: "Решенные", value: "resolved" },
];

const searchParamsSchema = z.object({
  type: z
    .enum(["all", "consultation", "partnership", "support", "wholesale"])
    .catch("all"),
  status: z.enum(["all", "new", "in_progress", "resolved"]).catch("all"),
  q: z.string().catch(""),
  page: z.coerce.number().min(1).catch(1),
});

export default async function RequestsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const allowedRoles = ["superadmin", "support"];

  if (!session?.user || !allowedRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  const rawParams = await props.searchParams;
  const parsedParams = searchParamsSchema.parse(rawParams);

  const {
    type: currentType,
    status: currentStatus,
    q: searchQuery,
    page: currentPage,
  } = parsedParams;

  const createFilterUrl = (type: string, status: string) => {
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (status !== "all") params.set("status", status);
    if (searchQuery) params.set("q", searchQuery);

    const str = params.toString();
    return `/dashboard/requests${str ? `?${str}` : ""}`;
  };

  const suspenseKey = `${currentType}-${currentStatus}-${searchQuery}-${currentPage}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          Входящие заявки
        </h1>
        <SearchInput paramName="q" placeholder="Поиск по ID или Email..." />
      </div>

      <div className="flex flex-col gap-4">
        <div className="border-border/50 flex flex-wrap gap-2 border-b pb-px">
          {TYPE_FILTERS.map((f) => {
            const isActive = currentType === f.value;
            return (
              <Link
                key={f.value}
                href={createFilterUrl(f.value, currentStatus)}
                className={cn(
                  "focus-visible:ring-ring rounded-t-md border-b-2 px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  isActive
                    ? "border-foreground text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => {
            const isActive = currentStatus === f.value;
            return (
              <Link
                key={f.value}
                href={createFilterUrl(currentType, f.value)}
                className={cn(
                  "focus-visible:ring-ring rounded-full px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2",
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      <Suspense
        key={suspenseKey}
        fallback={
          <div className="bg-card flex h-64 w-full items-center justify-center rounded-xl border">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        }
      >
        <RequestsTableWrapper
          type={currentType as RequestType}
          status={currentStatus as RequestStatus}
          query={searchQuery}
          page={currentPage}
        />
      </Suspense>
    </div>
  );
}
