import "server-only";
import { serverEnv } from "@/src/lib/env/server";
import { ozonStocksResponseSchema } from "./schemas";
import { updateStocksInDb, type NormalizedStock } from "../sync/stocks";

const OZON_API_URL = "https://api-seller.ozon.ru";

async function fetchOzonApi(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${OZON_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Client-Id": serverEnv.OZON_CLIENT_ID,
      "Api-Key": serverEnv.OZON_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Ozon API HTTP Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Боевая синхронизация остатков Ozon
 * @param options.debug Включает подробное логирование
 * @param options.dryRun Холостой прогон: скачивает, но НЕ пишет в БД. Возвращает данные.
 */
export async function syncOzonStocks(
  options: { debug?: boolean; dryRun?: boolean } = {},
) {
  const { debug = false, dryRun = false } = options; // Значения по умолчанию

  try {
    if (debug)
      console.log(`🚀 [OZON] Запуск синхронизации FBO... (Dry Run: ${dryRun})`);

    let lastId = "";
    let hasMore = true;
    let pageCount = 0;
    const allStocks: NormalizedStock[] = [];

    // 1. Извлечение данных (Pagination) - логика остается без изменений
    while (hasMore) {
      pageCount++;
      if (debug) console.log(`🔄 [OZON] Запрос страницы ${pageCount}...`);

      const rawData = await fetchOzonApi("/v4/product/info/stocks", {
        filter: { visibility: "ALL" },
        last_id: lastId,
        limit: 500,
      });

      const parsedData = ozonStocksResponseSchema.parse(rawData);

      for (const item of parsedData.items) {
        const fboStock = item.stocks.find((s) => s.type === "fbo");
        allStocks.push({
          article: item.offer_id,
          stock: fboStock ? fboStock.present : 0,
          marketplace: "ozon",
        });
      }

      if (parsedData.last_id && parsedData.last_id !== lastId) {
        lastId = parsedData.last_id;
      } else {
        hasMore = false;
      }
    }

    if (debug) {
      console.log(
        `\n📦 [OZON] Извлечение завершено. Получено артикулов: ${allStocks.length}`,
      );

      if (allStocks.length > 0) {
        const previewData = allStocks.slice(0, 150).map((item) => ({
          "Артикул (SKU)": item.article,
          "Остаток (FBO)": item.stock,
          Маркетплейс: item.marketplace.toUpperCase(),
        }));

        console.table(previewData);

        if (allStocks.length > 150) {
          console.log(
            `... и еще ${allStocks.length - 150} товаров скрыто для экономии памяти консоли.\n`,
          );
        }
      }
    }

    if (dryRun) {
      if (debug)
        console.log(
          "🛑 [OZON] DRY RUN АКТИВЕН: Пропускаем запись в базу данных.",
        );
      // Возвращаем сами данные, чтобы их можно было увидеть в Postman/Браузере
      return { success: true, synced: allStocks.length, data: allStocks };
    }

    // 3. Боевая запись в БД
    const dbResult = await updateStocksInDb(allStocks, debug);

    if (!dbResult.success) {
      throw new Error("Сбой на этапе записи в БД");
    }

    return { success: true, synced: allStocks.length };
  } catch (error: unknown) {
    return { success: false, error: "Sync Failed" };
  }
}
