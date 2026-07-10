import "server-only";
import { db } from "@/src/server/db/client";
import { products } from "@/src/server/db/schema";
import { eq } from "drizzle-orm";

export type NormalizedStock = {
  article: string;
  stock: number;
  marketplace: "ozon" | "wb";
};

/**
 * Разбивает массив на чанки для безопасной записи
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
}

export async function updateStocksInDb(
  stocks: NormalizedStock[],
  debug = false,
) {
  if (!stocks.length) return { success: true, updated: 0 };

  try {
    if (debug)
      console.log(`💾 [DB] Старт транзакции. Всего записей: ${stocks.length}`);

    // Разбиваем на пачки по 100 запросов, чтобы не перегрузить пул соединений
    const chunks = chunkArray(stocks, 100);

    await db.transaction(async (tx) => {
      for (const chunk of chunks) {
        // Параллельное выполнение UPDATE внутри одного чанка
        await Promise.all(
          chunk.map((item) => {
            const updateField =
              item.marketplace === "ozon"
                ? { ozonStockFbo: item.stock }
                : { fbsStock: item.stock };

            return tx
              .update(products)
              .set(updateField)
              .where(eq(products.itemArticle, item.article));
          }),
        );
      }
    });

    if (debug)
      console.log(`✅ [DB] Транзакция успешна. Обновлено: ${stocks.length}`);
    return { success: true, updated: stocks.length };
  } catch (error) {
    console.error("❌ [DB] Критическая ошибка при записи в PostgreSQL:", error);
    return { success: false, error: "Database transaction failed" };
  }
}
