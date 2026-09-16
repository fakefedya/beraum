import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq, lt, and, inArray } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { orders } from "@/src/server/db/schema/orders.schema";
import { discountItems } from "@/src/server/db/schema/discount.schema";
import { syncOzonStocks } from "@/src/server/services/ozon/client";
import { syncWbStocks, syncWbPrices } from "@/src/server/services/wb/client";
import { serverEnv } from "@/src/lib/env/server";
import crypto from "crypto";

export async function GET(request: Request) {
  // 1. Авторизация Cron-запроса
  const authHeader = request.headers.get("authorization") || "";
  const expectedHeader = `Bearer ${serverEnv.CRON_SECRET}`;

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
    // 2. Очистка старых заявок (старше 1 года)
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
    // 3. АВТО-ОТМЕНА ЗАКАЗОВ ДИСКОНТА (72 ЧАСА)
    // ==========================================
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    let releasedItemsCount = 0;

    // 3.1. Находим и отменяем зависшие заказы
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
      // Собираем все уникальные SKU из отмененных заказов
      const skusToRelease = expiredOrders.flatMap((order) =>
        order.items.map((item) => item.uniqueSku),
      );

      // Снимаем бронь с физических товаров
      if (skusToRelease.length > 0) {
        const released = await db
          .update(discountItems)
          .set({
            status: "available",
            reservedAt: null, // Сбрасываем время резерва
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

    // 3.2. Подчистка "сиротских" резервов (на случай сбоев транзакций)
    const orphanedItems = await db
      .update(discountItems)
      .set({ status: "available", reservedAt: null, updatedAt: new Date() })
      .where(
        and(
          eq(discountItems.status, "reserved"),
          lt(discountItems.reservedAt, threeDaysAgo), // Резерв старше 3 суток
        ),
      )
      .returning({ id: discountItems.id });

    releasedItemsCount += orphanedItems.length;

    // Сбрасываем кэш витрины, если появились новые товары
    if (releasedItemsCount > 0) {
      revalidateTag("discount_items", { expire: 0 });
    }

    // ==========================================
    // 4. Синхронизация маркетплейсов
    // ==========================================
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
      releasedDiscountItems: releasedItemsCount,
      changedProducts: changed,
      details: { ozonStocks, wbStocks, wbPrices },
    });
  } catch (error) {
    console.error("❌ Cron sync failed", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
