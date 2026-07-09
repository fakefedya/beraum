import "server-only";
import { serverEnv } from "@/src/lib/env/server";
import { ozonStocksResponseSchema } from "./schemas";

const OZON_API_URL = "https://api-seller.ozon.ru";

/**
 * Базовый fetcher с подстановкой секретов и защитой от кэширования
 */
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
    throw new Error(`🚨 Ozon API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * DRY RUN: Тестовый запрос для анализа артикулов
 */
export async function getOzonStocksDryRun() {
  try {
    console.log("🚀 [OZON] Запускаем тестовый запрос к API...");

    // Дергаем третью версию API (актуальная для остатков)
    const rawData = await fetchOzonApi("/v3/product/info/stocks", {
      filter: {}, // Без фильтров тянем всё
      last_id: "",
      limit: 50, // Для теста нам хватит 50 штук
    });

    // Пропускаем через строгую валидацию
    const parsedData = ozonStocksResponseSchema.parse(rawData);

    // Оставляем только нужную информацию для вывода
    const sample = parsedData.result.items.map((item) => {
      const fboStock = item.stocks.find((s) => s.type === "fbo");

      return {
        "Ozon Артикул (offer_id)": item.offer_id,
        "FBO Остаток": fboStock ? fboStock.present : 0,
      };
    });

    console.table(sample);

    return { success: true, data: sample };
  } catch (error) {
    console.error("❌ [OZON] Ошибка тестового прогона:", error);
    return { success: false, error: "Ошибка при получении данных" };
  }
}
