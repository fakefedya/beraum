import "server-only";
import { db } from "@/src/server/db/client";
import { products } from "@/src/server/db/schema";
import { eq } from "drizzle-orm";
import { serverEnv } from "@/src/lib/env/server";
import { chunkArray, delay } from "@/src/server/utils/sync-helpers";

const WB_API_URL = "https://content-api.wildberries.ru";

type WbCursor = {
  limit: number;
  updatedAt?: string;
  nmID?: number;
  total?: number;
};

type WbCard = {
  vendorCode: string;
  sizes?: Array<{
    chrtID: number;
  }>;
};

type WbApiResponse = {
  cards?: WbCard[];
  cursor?: WbCursor;
};

export async function syncWbSkusAutoMapper(debug = true) {
  try {
    if (debug)
      console.log(
        "🚀 [WB MAPPER] Запускаем авто-сопоставление артикулов (с пагинацией)...",
      );

    const localProducts = await db
      .select({ id: products.id, itemArticle: products.itemArticle })
      .from(products);

    let hasMore = true;
    let pageCount = 0;

    let currentCursor: WbCursor = { limit: 100 };
    const allWbCards: WbCard[] = [];

    while (hasMore) {
      pageCount++;
      if (debug)
        console.log(`🔄 [WB MAPPER] Запрашиваем страницу ${pageCount}...`);

      const res = await fetch(`${WB_API_URL}/content/v2/get/cards/list`, {
        method: "POST",
        headers: {
          Authorization: serverEnv.WB_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: {
            cursor: currentCursor,
            filter: { withPhoto: -1 },
          },
        }),
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`WB HTTP Error: ${res.status}`);

      const wbData = (await res.json()) as WbApiResponse;
      const cards = wbData.cards || [];
      allWbCards.push(...cards);

      const responseCursor = wbData.cursor;
      if (responseCursor && responseCursor.total === currentCursor.limit) {
        currentCursor = {
          limit: 100,
          updatedAt: responseCursor.updatedAt,
          nmID: responseCursor.nmID,
        };
        await delay(300);
      } else {
        hasMore = false;
      }
    }

    if (debug)
      console.log(
        `📦 [WB MAPPER] Скачано ${allWbCards.length} карточек. Начинаем маппинг...`,
      );

    const matchedUpdates: { id: string; wbChrtId: number }[] = [];
    const unmatched: Record<string, string>[] = [];

    for (const card of allWbCards) {
      const wbArticle = card.vendorCode;
      const wbChrtId = card.sizes?.[0]?.chrtID;

      if (!wbArticle || !wbChrtId) continue;

      const localProduct = localProducts.find(
        (p) => p.itemArticle === wbArticle,
      );

      if (localProduct) {
        matchedUpdates.push({
          id: localProduct.id,
          wbChrtId: Number(wbChrtId),
        });
      } else {
        unmatched.push({
          "Артикул WB": wbArticle,
          "ID Размера (chrtID)": String(wbChrtId),
        });
      }
    }

    const missingOnWb: Record<string, string>[] = [];
    for (const localProduct of localProducts) {
      const existsOnWb = allWbCards.some(
        (card) => card.vendorCode === localProduct.itemArticle,
      );
      if (!existsOnWb) {
        missingOnWb.push({
          "Наш Артикул (в БД)": localProduct.itemArticle,
        });
      }
    }

    if (matchedUpdates.length > 0) {
      const chunks = chunkArray(matchedUpdates, 100);

      await db.transaction(async (tx) => {
        for (const chunk of chunks) {
          await Promise.all(
            chunk.map((item) =>
              tx
                .update(products)
                .set({ wbChrtId: item.wbChrtId })
                .where(eq(products.id, item.id)),
            ),
          );
        }
      });
    }

    if (debug) {
      console.log(
        `✅ [WB MAPPER] Завершено. Обновлено совпадений: ${matchedUpdates.length}`,
      );

      if (unmatched.length > 0) {
        console.log(
          `\n⚠️ Найдено ${unmatched.length} товаров на WB, которых НЕТ в нашей БД:`,
        );
        console.table(unmatched);
      }

      if (missingOnWb.length > 0) {
        console.log(
          `\n🔎 Найдено ${missingOnWb.length} товаров в нашей БД, которых НЕТ на WB:`,
        );
        console.table(missingOnWb);
      }

      if (unmatched.length === 0 && missingOnWb.length === 0) {
        console.log(
          `\n🎉 Идеально! Базы данных WB и магазина полностью синхронизированы (1:1).`,
        );
      }
    }

    return { success: true, updated: matchedUpdates.length };
  } catch (error: unknown) {
    console.error("❌ [WB MAPPER] Ошибка сопоставления:", error);
    return { success: false, error: "Mapping failed" };
  }
}
