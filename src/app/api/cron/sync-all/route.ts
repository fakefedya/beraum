import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq, lt, and } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { syncOzonStocks } from "@/src/server/services/ozon/client";
import { syncWbStocks, syncWbPrices } from "@/src/server/services/wb/client";
import { serverEnv } from "@/src/lib/env/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    await db
      .delete(feedbackRequests)
      .where(
        and(
          eq(feedbackRequests.status, "resolved"),
          lt(feedbackRequests.updatedAt, oneYearAgo),
        ),
      );

    const ozonStocks = await syncOzonStocks();
    const wbStocks = await syncWbStocks();
    const wbPrices = await syncWbPrices();

    const changed =
      (ozonStocks.synced ?? 0) +
      (wbStocks.synced ?? 0) +
      (wbPrices.synced ?? 0);

    if (changed > 0) {
      revalidateTag("products", { expire: 0 });
    }

    return NextResponse.json({
      success: true,
      changed,
      details: { ozonStocks, wbStocks, wbPrices },
    });
  } catch (error) {
    console.error("❌ Cron sync failed", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
