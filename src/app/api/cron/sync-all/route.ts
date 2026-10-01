import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { eq, lt, and, inArray } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { orders } from "@/src/server/db/schema/orders.schema";
import { discountItems } from "@/src/server/db/schema/discount.schema";
import { syncOzonStocks } from "@/src/server/services/ozon/client";
import { syncWbStocks, syncWbPrices } from "@/src/server/services/wb/client";
import { syncWbSkusAutoMapper } from "@/src/server/services/wb/init-skus";
import { serverEnv } from "@/src/lib/env/server";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  if (!serverEnv.CRON_SECRET) {
    console.error(
      "❌ CRON_SECRET не задан. Эндпоинт отключен для защиты от DoS.",
    );
    return new Response("Internal Server Error", { status: 500 });
  }

  const authHeader = request.headers.get("authorization") || "";
  const expectedHeader = `Bearer ${serverEnv.CRON_SECRET}`;

  const debug = request.nextUrl.searchParams.get("debug") === "true";
  const dryRun = request.nextUrl.searchParams.get("dryRun") === "true";
  const syncOptions = { debug, dryRun };

  if (debug) {
    console.log(`\n=========================================`);
    console.log(`🤖 СТАРТ ОРКЕСТРАТОРА (DryRun: ${dryRun})`);
    console.log(`=========================================\n`);
  }

  // 2. Безопасное сравнение строк
  if (authHeader.length !== expectedHeader.length) {
    return new Response("Unauthorized", { status: 401 });
  }

  const isMatch = crypto.timingSafeEqual(
    Buffer.from(authHeader, "utf8"),
    Buffer.from(expectedHeader, "utf8"),
  );

  if (!isMatch) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Очистка старых заявок (старше 1 года)
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

    // ==========================================
    // АВТО-ОТМЕНА ЗАКАЗОВ ДИСКОНТА (72 ЧАСА)
    // ==========================================
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    let releasedItemsCount = 0;

    const expiredOrders = await db
      .update(orders)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(
        and(
          inArray(orders.status, ["new", "processing"]),
          lt(orders.createdAt, threeDaysAgo),
        ),
      )
      .returning({ items: orders.items });

    if (expiredOrders.length > 0) {
      const skusToRelease = expiredOrders.flatMap((order) =>
        order.items.map((item) => item.uniqueSku),
      );

      if (skusToRelease.length > 0) {
        const released = await db
          .update(discountItems)
          .set({
            status: "available",
            reservedAt: null,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(discountItems.status, "reserved"),
              inArray(discountItems.uniqueSku, skusToRelease),
            ),
          )
          .returning({ id: discountItems.id });

        releasedItemsCount += released.length;
      }
    }

    const orphanedItems = await db
      .update(discountItems)
      .set({ status: "available", reservedAt: null, updatedAt: new Date() })
      .where(
        and(
          eq(discountItems.status, "reserved"),
          lt(discountItems.reservedAt, threeDaysAgo),
        ),
      )
      .returning({ id: discountItems.id });

    releasedItemsCount += orphanedItems.length;

    if (releasedItemsCount > 0) {
      revalidateTag("discount_items", { expire: 0 });
    }

    // ==========================================
    // СИНХРОНИЗАЦИЯ МАРКЕТПЛЕЙСОВ
    // ==========================================

    await syncWbSkusAutoMapper(debug);

    const ozonStocks = await syncOzonStocks(syncOptions);
    const wbStocks = await syncWbStocks(syncOptions);
    const wbPrices = await syncWbPrices(syncOptions);

    const changed =
      (ozonStocks.synced ?? 0) +
      (wbStocks.synced ?? 0) +
      (wbPrices.synced ?? 0);

    if (changed > 0) {
      revalidateTag("products", { expire: 0 });
    }

    return NextResponse.json({
      success: true,
      releasedDiscountItems: releasedItemsCount,
      changedProducts: changed,
      details: { ozonStocks, wbStocks, wbPrices },
    });
  } catch (error) {
    console.error("❌ Cron sync failed", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
