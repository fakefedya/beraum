import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { syncOzonStocks } from "@/src/server/services/ozon/client";
import { syncWbStocks, syncWbPrices } from "@/src/server/services/wb/client";
import { serverEnv } from "@/src/lib/env/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const ozonStocks = await syncOzonStocks();
    const wbStocks = await syncWbStocks();
    const wbPrices = await syncWbPrices();

    // Считаем общее количество измененных товаров
    const changed =
      (ozonStocks.synced ?? 0) +
      (wbStocks.synced ?? 0) +
      (wbPrices.synced ?? 0);

    // 🚀 CACHE PURGE: Гарантированный немедленный сброс кэша
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
