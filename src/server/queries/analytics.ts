import "server-only";
import { db } from "@/src/server/db/client";
import { marketplaceClicks } from "@/src/server/db/schema";
import { desc, gte, count, eq, and } from "drizzle-orm";
import { z } from "zod";

export const periodSchema = z.enum(["7d", "30d", "90d", "all"]).catch("30d");
export type AnalyticsPeriod = z.infer<typeof periodSchema>;

// 🛡️ SECURITY: Строгий whitelist для артикула (только латиница, цифры, тире, подчеркивания)
export const articleSearchSchema = z
  .string()
  .regex(/^[A-Za-z0-9\-_]+$/, "Неверный формат артикула")
  .optional()
  .catch(undefined);

function getCutoffDate(period: AnalyticsPeriod): Date | undefined {
  if (period === "all") return undefined;

  const daysMap: Record<Exclude<AnalyticsPeriod, "all">, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };

  const d = new Date();
  d.setDate(d.getDate() - daysMap[period]);
  return d;
}

export async function getDashboardAnalytics(
  rawPeriod: string | undefined,
  rawArticle: string | undefined,
) {
  const period = periodSchema.parse(rawPeriod);
  const article = articleSearchSchema.parse(rawArticle);
  const cutoffDate = getCutoffDate(period);

  const dateFilter = cutoffDate
    ? gte(marketplaceClicks.createdAt, cutoffDate)
    : undefined;
  const articleFilter = article
    ? eq(marketplaceClicks.article, article)
    : undefined;

  const finalFilter = and(dateFilter, articleFilter);

  const [totalResult, marketplaceStats, topArticles, recentEvents] =
    await Promise.all([
      db.select({ value: count() }).from(marketplaceClicks).where(finalFilter),

      db
        .select({
          marketplace: marketplaceClicks.marketplace,
          clicks: count(),
        })
        .from(marketplaceClicks)
        .where(finalFilter)
        .groupBy(marketplaceClicks.marketplace)
        .orderBy(desc(count())),

      // Если ищем конкретный артикул, этот блок вернет только его (что логично)
      db
        .select({
          article: marketplaceClicks.article,
          clicks: count(),
        })
        .from(marketplaceClicks)
        .where(finalFilter)
        .groupBy(marketplaceClicks.article)
        .orderBy(desc(count()))
        .limit(10),

      db
        .select({
          id: marketplaceClicks.id,
          article: marketplaceClicks.article,
          marketplace: marketplaceClicks.marketplace,
          userAgent: marketplaceClicks.userAgent,
          createdAt: marketplaceClicks.createdAt,
        })
        .from(marketplaceClicks)
        .where(finalFilter)
        .orderBy(desc(marketplaceClicks.createdAt))
        .limit(15),
    ]);

  return {
    total: totalResult[0]?.value || 0,
    marketplaces: marketplaceStats,
    topArticles,
    recentEvents,
    searchedArticle: article,
  };
}
