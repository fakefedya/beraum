import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/src/server/db/client";

export type NormalizedStock = {
  article: string;
  stock: number;
  marketplace: "ozon" | "wb";
};

export async function updateStocksInDb(
  stocks: NormalizedStock[],
  debug = false,
) {
  if (!stocks.length) return { success: true, updated: 0 };

  try {
    if (debug)
      console.log(
        `💾 [DB] Старт пакетного обновления. Всего записей: ${stocks.length}`,
      );

    const ozonStocks = stocks.filter((s) => s.marketplace === "ozon");
    const wbStocks = stocks.filter((s) => s.marketplace === "wb");

    await db.transaction(async (tx) => {
      // Пакетное обновление Ozon
      if (ozonStocks.length > 0) {
        const articles = ozonStocks.map((s) => s.article);
        const values = ozonStocks.map((s) => s.stock);

        await tx.execute(sql`
          UPDATE products AS p
          SET ozon_stock_fbo = u.stock::int
          FROM (
            SELECT unnest(${articles}::text[]) AS article, 
                   unnest(${values}::int[]) AS stock
          ) AS u
          WHERE p.item_article = u.article
        `);
      }

      // Пакетное обновление Wildberries
      if (wbStocks.length > 0) {
        const articles = wbStocks.map((s) => s.article);
        const values = wbStocks.map((s) => s.stock);

        await tx.execute(sql`
          UPDATE products AS p
          SET fbs_stock = u.stock::int
          FROM (
            SELECT unnest(${articles}::text[]) AS article, 
                   unnest(${values}::int[]) AS stock
          ) AS u
          WHERE p.item_article = u.article
        `);
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
