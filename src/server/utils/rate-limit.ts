import "server-only";
import { headers } from "next/headers";
import crypto from "crypto";
import { sql } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { rateLimits } from "@/src/server/db/schema/analytics.schema";

export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const realIp = headersList.get("x-real-ip");
  const forwardedFor = headersList.get("x-forwarded-for");

  if (realIp) return realIp;
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    return ips[ips.length - 1].trim();
  }
  return "127.0.0.1";
}

export async function checkRateLimit(
  action: string,
  limit: number,
  windowMs: number,
): Promise<{ success: boolean; ipHash: string }> {
  const ip = await getClientIp();
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
  const key = `${action}:${ipHash}`;
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
