import { Metadata } from "next";
import { auth } from "@/src/lib/auth/auth";
import { redirect } from "next/navigation";
import {
  getFeedbackRequests,
  type RequestType,
  type RequestStatus,
} from "@/src/server/queries/requests";
import { getCategoriesList } from "@/src/server/queries/categories";
import { RequestsTable } from "./_components/RequestsTable";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { RequestsSearch } from "./_components/RequestsSearch";

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

export default async function RequestsPage(props: {
  searchParams: Promise<{ type?: string; status?: string; q?: string }>;
}) {
  const session = await auth();
  const allowedRoles = ["superadmin", "support"];

  if (!session?.user || !allowedRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  const resolvedParams = await props.searchParams;
  const currentType = (resolvedParams.type as RequestType) || "all";
  const currentStatus = (resolvedParams.status as RequestStatus) || "all";
  const searchQuery = resolvedParams.q || ""; // 👈 Достаем query

  // Запрашиваем заявки и категории параллельно для оптимизации
  const [{ data: requests }, { data: categories }] = await Promise.all([
    getFeedbackRequests(currentType, currentStatus, searchQuery), // 👈 Передаем в DAL
    getCategoriesList(),
  ]);

  const createFilterUrl = (type: string, status: string) => {
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (status !== "all") params.set("status", status);
    if (searchQuery) params.set("q", searchQuery);
    const str = params.toString();
    return `/dashboard/requests${str ? `?${str}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          Входящие заявки
        </h1>
        <RequestsSearch />
      </div>

      <div className="flex flex-col gap-4">
        {/* Фильтр по типам (Табы) */}
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

        {/* Фильтр по статусам (Pills) */}
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

      <RequestsTable requests={requests || []} categories={categories || []} />
    </div>
  );
}
