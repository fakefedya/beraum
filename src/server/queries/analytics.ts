import "server-only";

import { db } from "@/src/server/db/client";
import { marketplaceClicks } from "@/src/server/db/schema";
import { desc, gte, count, eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { unstable_cache } from "next/cache";

export const periodSchema = z.enum(["7d", "30d", "90d", "all"]).catch("30d");
export type AnalyticsPeriod = z.infer<typeof periodSchema>;

export const articleSearchSchema = z
  .string()
  .regex(/^[A-Za-z0-9\-_]+$/)
  .optional()
  .catch(undefined);

function getCutoffDate(period: AnalyticsPeriod): Date | undefined {
  if (period === "all") return undefined;
  const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysMap[period]);
  return d;
}

async function fetchAnalyticsFromDb(
  period: AnalyticsPeriod,
  article: string | undefined,
) {
  const cutoffDate = getCutoffDate(period);
  const dateFilter = cutoffDate
    ? gte(marketplaceClicks.createdAt, cutoffDate)
    : undefined;
  const articleFilter = article
    ? eq(marketplaceClicks.article, article)
    : undefined;
  const finalFilter = and(dateFilter, articleFilter);

  const isFullScan = period === "all" && !article;

  const totalPromise = isFullScan
    ? db
        .execute(
          sql`SELECT reltuples::bigint as estimate FROM pg_class WHERE relname = 'marketplace_clicks'`,
        )
        .then((res) => Number(res[0]?.estimate || 0))
    : db
        .select({ value: count() })
        .from(marketplaceClicks)
        .where(finalFilter)
        .then((res) => res[0]?.value || 0);

  const [totalValue, marketplaceStats, topArticles, recentEvents] =
    await Promise.all([
      totalPromise,
      db
        .select({ marketplace: marketplaceClicks.marketplace, clicks: count() })
        .from(marketplaceClicks)
        .where(finalFilter)
        .groupBy(marketplaceClicks.marketplace)
        .orderBy(desc(count())),
      db
        .select({ article: marketplaceClicks.article, clicks: count() })
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
          source: marketplaceClicks.source,
          deviceType: marketplaceClicks.deviceType,
          createdAt: marketplaceClicks.createdAt,
        })
        .from(marketplaceClicks)
        .where(finalFilter)
        .orderBy(desc(marketplaceClicks.createdAt))
        .limit(15),
    ]);

  return {
    total: totalValue,
    marketplaces: marketplaceStats,
    topArticles,
    recentEvents,
    searchedArticle: article,
  };
}

const getGlobalAnalyticsCached = unstable_cache(
  async (period: AnalyticsPeriod) => fetchAnalyticsFromDb(period, undefined),
  ["global-analytics"],
  { revalidate: 300, tags: ["analytics"] },
);

export async function getDashboardAnalytics(
  rawPeriod: string | undefined,
  rawArticle: string | undefined,
) {
  const period = periodSchema.parse(rawPeriod);
  const article = articleSearchSchema.parse(rawArticle);

  if (article) {
    return fetchAnalyticsFromDb(period, article);
  }

  return getGlobalAnalyticsCached(period);
}
