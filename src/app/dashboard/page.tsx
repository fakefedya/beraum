import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDashboardAnalytics } from "@/src/server/queries/analytics";
import { PeriodSelector } from "./_components/PeriodSelector";
import { SearchInput } from "@/src/components/shared/SearchInput";
import { MousePointerClick } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { requireAuthRole } from "@/src/server/utils/auth-check";

export const metadata: Metadata = {
  title: "Дашборд — Beraum",
  robots: { index: false, follow: false },
};

const MARKETPLACE_LABELS: Record<string, string> = {
  ozon: "Ozon",
  wb: "Wildberries",
  ymarket: "Яндекс Маркет",
  mvideo: "М.Видео",
};

const DEVICE_LABELS: Record<string, string> = {
  mobile: "📱 Мобильное",
  desktop: "💻 Десктоп",
  unknown: "❓ Неизвестно",
};

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    await requireAuthRole(["superadmin", "manager", "support"]);
  } catch {
    redirect("/auth/login");
  }

  const resolvedParams = await props.searchParams;
  const period =
    typeof resolvedParams.period === "string" ? resolvedParams.period : "30d";
  const article =
    typeof resolvedParams.article === "string"
      ? resolvedParams.article
      : undefined;

  const suspenseKey = `${period}-${article || "all"}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          Сводка переходов
        </h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            paramName="article"
            placeholder="Аналитика по артикулу (SKU)..."
          />
          <PeriodSelector />
        </div>
      </div>

      <Suspense
        key={suspenseKey}
        fallback={<AnalyticsSkeleton hasArticle={!!article} />}
      >
        <AnalyticsContent period={period} article={article} />
      </Suspense>
    </div>
  );
}

function AnalyticsSkeleton({ hasArticle }: { hasArticle: boolean }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-card flex flex-col gap-3 rounded-2xl border p-6 shadow-sm">
          <div className="bg-muted h-4 w-24 animate-pulse rounded-md" />
          <div className="bg-muted mt-1 h-8 w-32 animate-pulse rounded-md" />
        </div>

        <div className="bg-card flex flex-col gap-5 rounded-2xl border p-6 shadow-sm md:col-span-2">
          <div className="bg-muted h-4 w-48 animate-pulse rounded-md" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <div className="bg-muted h-3 w-20 animate-pulse rounded-md" />
                  <div className="bg-muted h-3 w-16 animate-pulse rounded-md" />
                </div>
                <div className="bg-muted h-2 w-full animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {!hasArticle && (
          <div className="bg-card flex min-h-[300px] flex-col overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/50 border-b p-6">
              <div className="bg-muted h-5 w-40 animate-pulse rounded-md" />
            </div>
            <div className="flex flex-col gap-4 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted h-5 w-full animate-pulse rounded-md"
                />
              ))}
            </div>
          </div>
        )}

        <div
          className={cn(
            "bg-card flex min-h-[300px] flex-col overflow-hidden rounded-2xl border shadow-sm",
            hasArticle && "lg:col-span-2",
          )}
        >
          <div className="border-border/50 border-b p-6">
            <div className="bg-muted h-5 w-40 animate-pulse rounded-md" />
          </div>
          <div className="flex flex-col gap-4 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted h-8 w-full animate-pulse rounded-md"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function AnalyticsContent({
  period,
  article,
}: {
  period: string;
  article?: string;
}) {
  const stats = await getDashboardAnalytics(period, article);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-card flex flex-col gap-2 rounded-2xl border p-6 shadow-sm">
          <span className="text-muted-foreground text-sm font-medium">
            {stats.searchedArticle
              ? `Переходы: ${stats.searchedArticle}`
              : "Всего переходов"}
          </span>
          <div className="flex items-center gap-3">
            <MousePointerClick className="text-brand-secondary-muted size-6" />
            <span className="text-3xl font-bold">
              {stats.total.toLocaleString("ru-RU")}
            </span>
          </div>
        </div>

        <div className="bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm md:col-span-2">
          <span className="text-muted-foreground text-sm font-medium">
            Распределение по площадкам
          </span>
          <div className="flex flex-col gap-3">
            {stats.marketplaces.map((mp) => {
              const percentage =
                stats.total > 0
                  ? Math.round((mp.clicks / stats.total) * 100)
                  : 0;
              const displayName =
                MARKETPLACE_LABELS[mp.marketplace] || mp.marketplace;

              return (
                <div key={mp.marketplace} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{displayName}</span>
                    <span>
                      {mp.clicks.toLocaleString("ru-RU")} ({percentage}%)
                    </span>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-foreground h-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {stats.marketplaces.length === 0 && (
              <span className="text-muted-foreground text-sm">Нет данных</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {!stats.searchedArticle && (
          <div className="bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/50 border-b p-6">
              <h2 className="font-semibold">Топ-10 моделей</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/30 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Артикул</th>
                    <th className="px-6 py-3 text-right font-medium">
                      Переходы
                    </th>
                  </tr>
                </thead>
                <tbody className="border-border/50 divide-y">
                  {stats.topArticles.map((item, idx) => (
                    <tr
                      key={item.article}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-medium">
                        <span className="text-muted-foreground mr-3">
                          {idx + 1}.
                        </span>
                        {item.article}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {item.clicks.toLocaleString("ru-RU")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div
          className={cn(
            "bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm",
            stats.searchedArticle && "lg:col-span-2",
          )}
        >
          <div className="border-border/50 border-b p-6">
            <h2 className="font-semibold">Последние клики</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 text-muted-foreground text-xs uppercase">
                <tr>
                  {!stats.searchedArticle && (
                    <th className="px-6 py-3 font-medium">Модель</th>
                  )}
                  <th className="px-6 py-3 font-medium">МП</th>
                  <th className="px-6 py-3 font-medium">Источник</th>
                  <th className="px-6 py-3 text-right font-medium">
                    Устройство
                  </th>
                </tr>
              </thead>
              <tbody className="border-border/50 divide-y">
                {stats.recentEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {!stats.searchedArticle && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-medium">
                            {event.article}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            {new Intl.DateTimeFormat("ru-RU", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(new Date(event.createdAt))}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="bg-muted w-fit rounded-md px-2 py-1 text-[10px] font-semibold tracking-wider uppercase">
                          {MARKETPLACE_LABELS[event.marketplace] ||
                            event.marketplace}
                        </span>
                        {stats.searchedArticle && (
                          <span className="text-muted-foreground text-[10px]">
                            {new Intl.DateTimeFormat("ru-RU", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(new Date(event.createdAt))}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-foreground text-xs font-medium">
                        {event.source === "unknown"
                          ? "Прямой переход"
                          : event.source}
                      </span>
                    </td>
                    <td className="text-foreground px-6 py-4 text-right text-xs font-medium">
                      {DEVICE_LABELS[event.deviceType] || DEVICE_LABELS.unknown}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
