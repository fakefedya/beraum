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

    // Дергаем третью версию API
    const rawData = await fetchOzonApi("/v4/product/info/stocks", {
      filter: {
        visibility: "ALL",
      },
      limit: 500,
    });

    console.log("📦 [OZON] Сырой ответ получен! Ключи Ozon работают.");

    // ВРЕМЕННО: выводим кусок сырых данных в консоль перед валидацией
    console.log(
      "Сырые данные (первые 300 символов):",
      JSON.stringify(rawData).slice(0, 300),
    );

    // Пропускаем через Zod-мясорубку
    const parsedData = ozonStocksResponseSchema.parse(rawData);

    const sample = parsedData.items.map((item) => {
      const fboStock = item.stocks.find((s) => s.type === "fbo");
      return {
        "Ozon Артикул (offer_id)": item.offer_id,
        "FBO Остаток": fboStock ? fboStock.present : 0,
      };
    });

    console.table(sample);
    return { success: true, data: sample };
  } catch (error: any) {
    // 🚨 Детальный разбор ошибки
    console.error("\n❌ [OZON] ПРОИЗОШЛА ОШИБКА!");

    if (error.name === "ZodError") {
      console.error(
        "⚠️ Ошибка валидации Zod (Ozon поменял формат или прислал неожиданные данные):",
      );
      console.error(JSON.stringify(error.format(), null, 2));
    } else {
      console.error("⚠️ Ошибка HTTP или сети:", error.message || error);
    }

    return {
      success: false,
      error: "Ошибка при получении данных",
      details: error.message,
    };
  }
}
