import "server-only";
import { z } from "zod";
import { db } from "@/src/server/db/client";
import { products } from "@/src/server/db/schema";
import { isNotNull } from "drizzle-orm";
import { serverEnv } from "@/src/lib/env/server";
import { wbStocksResponseSchema } from "./schemas";
import { updateStocksInDb, type NormalizedStock } from "../sync/stocks";

const WB_API_URL = "https://marketplace-api.wildberries.ru";
const WB_WAREHOUSES = [1418630, 1397109]; // МГТ и СГТ

async function fetchWbApi(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${WB_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: serverEnv.WB_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`WB API HTTP Error: ${res.status}`);
  return res.json();
}

// Хелпер для батчинга массива
function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
}

export async function syncWbStocks(
  options: { debug?: boolean; dryRun?: boolean } = {},
) {
  const { debug = false, dryRun = false } = options;

  try {
    if (debug)
      console.log(
        `🚀 [WB] Запуск синхронизации FBS (МГТ + СГТ)... (Dry Run: ${dryRun})`,
      );

    // 1. Достаем все привязанные chrtId из нашей БД
    const localProducts = await db
      .select({ article: products.itemArticle, chrtId: products.wbChrtId })
      .from(products)
      .where(isNotNull(products.wbChrtId));

    if (localProducts.length === 0) {
      if (debug)
        console.log(
          "⚠️ [WB] В базе нет товаров с wbChrtId. Синхронизация отменена.",
        );
      return { success: true, synced: 0 };
    }

    const allChrtIds = localProducts.map((p) => p.chrtId as number);
    const stockMap = new Map<string, number>(); // Карта: chrtId -> суммарный остаток

    // 2. Идем по складам и запрашиваем остатки
    for (const warehouseId of WB_WAREHOUSES) {
      if (debug) console.log(`🔄 [WB] Запрашиваем склад ID: ${warehouseId}...`);

      const chunks = chunkArray(allChrtIds, 1000); // WB лимит: 1000 SKU за раз

      for (const chunk of chunks) {
        const rawData = await fetchWbApi(`/api/v3/stocks/${warehouseId}`, {
          chrtIds: chunk,
        });

        if (debug && chunk === chunks[0]) {
          console.log(
            `📦 [WB] Сырой ответ склада ${warehouseId}:`,
            JSON.stringify(rawData).slice(0, 200),
          );
        }

        const parsed = wbStocksResponseSchema.parse(rawData);

        for (const item of parsed.stocks) {
          const id = item.chrtId ?? item.sku;
          if (!id) continue;

          const idStr = String(id);
          const currentStock = stockMap.get(idStr) || 0;
          stockMap.set(idStr, currentStock + item.amount);
        }
      }
    }

    // 3. Формируем массив для записи в БД
    const allStocks: NormalizedStock[] = [];

    for (const p of localProducts) {
      if (!p.chrtId) continue;

      allStocks.push({
        article: p.article,
        stock: stockMap.get(String(p.chrtId)) || 0, // Если WB ничего не вернул — значит остаток 0
        marketplace: "wb", // Важно! Наш sync-сервис переведет это в колонку fbsStock
      });
    }

    if (debug) {
      console.log(
        `\n📦 [WB] Извлечение завершено. Подготовлено артикулов: ${allStocks.length}`,
      );
      if (allStocks.length > 0) console.table(allStocks.slice(0, 200));
    }

    // 4. Запись (или Dry-Run)
    if (dryRun) {
      if (debug) console.log("🛑 [WB] DRY RUN АКТИВЕН: Запись в БД пропущена.");
      return { success: true, synced: allStocks.length, data: allStocks };
    }

    const dbResult = await updateStocksInDb(allStocks, debug);
    if (!dbResult.success) throw new Error("Сбой на этапе записи в БД");

    return { success: true, synced: allStocks.length };
  } catch (error: unknown) {
    console.error("\n❌ [WB] СИНХРОНИЗАЦИЯ ПРЕРВАНА:");
    if (error instanceof z.ZodError) {
      console.error(
        "⚠️ Нарушен контракт ответа API:",
        JSON.stringify(error.format()),
      );
    } else if (error instanceof Error) {
      console.error("⚠️ Системная ошибка:", error.message);
    }
    return { success: false, error: "Sync Failed" };
  }
}
