import "server-only";
import { z } from "zod";
import { db } from "@/src/server/db/client";
import { products } from "@/src/server/db/schema";
import { isNotNull, eq } from "drizzle-orm";
import { serverEnv } from "@/src/lib/env/server";
import { wbPricesResponseSchema, wbStocksResponseSchema } from "./schemas";
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

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[WB API ERROR] ${endpoint} -> ${res.status}:`, errorText);
    throw new Error(`WB API HTTP Error: ${res.status}`);
  }
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

// === ИНТЕГРАЦИЯ ЦЕН WB ===

const WB_PRICES_API_URL = "https://discounts-prices-api.wildberries.ru";

// Хелпер для запросов к API цен (Тут используется GET)
async function fetchWbPricesApi(endpoint: string) {
  const res = await fetch(`${WB_PRICES_API_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Authorization: serverEnv.WB_API_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[WB PRICES ERROR] ${endpoint} -> ${res.status}:`, errorText);
    throw new Error(`WB API HTTP Error: ${res.status}`);
  }
  return res.json();
}

export async function syncWbPrices(
  options: { debug?: boolean; dryRun?: boolean } = {},
) {
  const { debug = false, dryRun = false } = options;

  try {
    if (debug)
      console.log(`🚀 [WB ЦЕНЫ] Запуск выгрузки... (Dry Run: ${dryRun})`);

    // 👇 Достаем все наши артикулы из БД для сверки
    const localProducts = await db
      .select({ article: products.itemArticle })
      .from(products);

    let offset = 0;
    const limit = 1000;
    let hasMore = true;
    const allPrices: { article: string; price: number }[] = [];

    // 1. Выгружаем все цены с пагинацией
    while (hasMore) {
      if (debug)
        console.log(`🔄 [WB ЦЕНЫ] Запрашиваем блок (offset: ${offset})...`);

      const rawData = await fetchWbPricesApi(
        `/api/v2/list/goods/filter?limit=${limit}&offset=${offset}`,
      );
      const parsed = wbPricesResponseSchema.parse(rawData);
      const goods = parsed.data.listGoods;

      if (goods.length === 0) {
        hasMore = false;
        break;
      }

      for (const item of goods) {
        const discountedPrice = item.sizes[0]?.discountedPrice;
        if (discountedPrice !== undefined) {
          allPrices.push({
            article: item.vendorCode,
            price: Math.round(discountedPrice), // Наше округление
          });
        }
      }

      if (goods.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
        await new Promise((res) => setTimeout(res, 300));
      }
    }

    // 👇 1.5 ОБРАТНАЯ СВЕРКА
    if (debug) {
      const wbArticles = new Set(allPrices.map((p) => p.article));
      const localArticles = new Set(localProducts.map((p) => p.article));

      const missingInDb = allPrices.filter(
        (p) => !localArticles.has(p.article),
      );
      const missingOnWb = localProducts.filter(
        (p) => !wbArticles.has(p.article),
      );

      if (missingInDb.length > 0) {
        console.log(
          `\n⚠️ [WB ЦЕНЫ] На WB есть цены для ${missingInDb.length} товаров, которых НЕТ в нашей базе:`,
        );
        console.table(
          missingInDb.map((i) => ({ "Артикул WB": i.article, Цена: i.price })),
        );
      }

      if (missingOnWb.length > 0) {
        console.log(
          `\n🔎 [WB ЦЕНЫ] В нашей БД есть ${missingOnWb.length} товаров, которых НЕТ в выгрузке цен WB:`,
        );
        console.table(missingOnWb.map((i) => ({ "Наш Артикул": i.article })));
      }

      if (missingInDb.length === 0 && missingOnWb.length === 0) {
        console.log(
          `\n🎉 [WB ЦЕНЫ] Идеально! Базы данных полностью синхронизированы (1:1).`,
        );
      }
    }

    if (debug) {
      console.log(`\n📦 [WB ЦЕНЫ] Загружено товаров с WB: ${allPrices.length}`);
    }

    if (dryRun) {
      if (debug) console.log("🛑 [WB ЦЕНЫ] DRY RUN АКТИВЕН: Запись пропущена.");
      return { success: true, synced: allPrices.length, data: allPrices };
    }

    // 2. Запись в БД
    const chunks = chunkArray(allPrices, 100);
    await db.transaction(async (tx) => {
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map((item) =>
            tx
              .update(products)
              .set({ wbDiscountedPrice: item.price })
              .where(eq(products.itemArticle, item.article)),
          ),
        );
      }
    });

    if (debug) console.log(`✅ [DB] Цены успешно обновлены в базе!`);
    return { success: true, synced: allPrices.length };
  } catch (error: unknown) {
    console.error("\n❌ [WB ЦЕНЫ] СИНХРОНИЗАЦИЯ ПРЕРВАНА:");
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
