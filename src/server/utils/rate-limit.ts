import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { rateLimits } from "@/src/server/db/schema/analytics.schema";
import { getClientIp, hashIp } from "./ip";

export async function checkRateLimit(
  action: string,
  limit: number,
  windowMs: number,
  identifier?: string,
): Promise<{ success: boolean; ipHash: string }> {
  const ip = await getClientIp();
  const ipHash = hashIp(ip);
  const key = identifier
    ? `${action}:${ipHash}:${identifier}`
    : `${action}:${ipHash}`;
  const resetAt = new Date(Date.now() + windowMs);

  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, resetAt })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE WHEN ${rateLimits.resetAt} < now() THEN 1 ELSE ${rateLimits.count} + 1 END`,
        resetAt: sql`CASE WHEN ${rateLimits.resetAt} < now() THEN EXCLUDED.reset_at ELSE ${rateLimits.resetAt} END`,
      },
    })
    .returning({ count: rateLimits.count });

  return {
    success: row.count <= limit,
    ipHash,
  };
}
