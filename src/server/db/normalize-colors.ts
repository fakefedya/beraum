// src/server/db/normalize-colors.ts
import { db } from "./client";
import { products } from "./schema";
import { eq } from "drizzle-orm";

// 🚨 СТОП-КРАН: Пока здесь true, скрипт только показывает план изменений, но НЕ трогает БД
const IS_DRY_RUN = false;

// Парсер бизнес-логики цветов
function parseArticle(itemArticle: string): {
  siteArticle: string;
  colorName: string;
} {
  // 1. Жесткие исключения (V2 и специфичные модели)
  if (itemArticle === "RS-178NF424I1")
    return { siteArticle: "RS-178NF424I1", colorName: "Черный" };
  if (itemArticle === "DW-42T1T7S1W")
    return { siteArticle: "DW-42T1T7S1", colorName: "Белый" };
  if (itemArticle === "HK-6G502B_V2")
    return { siteArticle: "HK-6G502_V2", colorName: "Черный" };
  if (itemArticle === "HK-3S003B_V2")
    return { siteArticle: "HK-3S003_V2", colorName: "Черный" };
  if (itemArticle === "HK-3S003W_V2")
    return { siteArticle: "HK-3S003_V2", colorName: "Белый" };
  if (itemArticle === "HK-3S003BE_V2")
    return { siteArticle: "HK-3S003_V2", colorName: "Бежевый" };

  // 2. Правила по префиксам категорий
  if (itemArticle.startsWith("RB-"))
    return { siteArticle: itemArticle, colorName: "Белый" };
  if (itemArticle.startsWith("FB-"))
    return { siteArticle: itemArticle, colorName: "Белый" };
  if (itemArticle.startsWith("DW-"))
    return { siteArticle: itemArticle, colorName: "Серый металлик" };
  if (itemArticle.startsWith("CD-"))
    return { siteArticle: itemArticle, colorName: "Черный" };

  // 3. Динамический парсинг суффиксов (порядок важен: от длинных к коротким!)
  const suffixes = [
    { suffix: "MB", color: "Матовый черный" },
    { suffix: "MW", color: "Матовый белый" },
    { suffix: "BE", color: "Бежевый" },
    { suffix: "GD", color: "Золотой" },
    { suffix: "GY", color: "Серый" },
    { suffix: "W", color: "Белый" },
    { suffix: "B", color: "Черный" },
    { suffix: "Y", color: "Желтый" },
    { suffix: "R", color: "Красный" },
    { suffix: "I", color: "Серый металлик" },
  ];

  for (const { suffix, color } of suffixes) {
    if (itemArticle.endsWith(suffix)) {
      return {
        siteArticle: itemArticle.slice(0, -suffix.length), // Отрезаем суффикс
        colorName: color,
      };
    }
  }

  // 4. По умолчанию (отсутствие буквы)
  return { siteArticle: itemArticle, colorName: "Черный" };
}

async function main() {
  console.log("🔍 Начинаем аудит артикулов...");

  // Получаем все товары
  const allProducts = await db
    .select({
      id: products.id,
      itemArticle: products.itemArticle,
      oldSiteArticle: products.siteArticle,
      oldColor: products.colorName,
    })
    .from(products);

  const plan = [];
  let changesCount = 0;

  for (const product of allProducts) {
    const { siteArticle: newSiteArticle, colorName: newColor } = parseArticle(
      product.itemArticle,
    );

    // Если нужно что-то менять
    if (
      product.oldSiteArticle !== newSiteArticle ||
      product.oldColor !== newColor
    ) {
      plan.push({
        "SKU (itemArticle)": product.itemArticle,
        "Модель (Было)": product.oldSiteArticle,
        "Модель (Станет)": newSiteArticle,
        "Цвет (Станет)": newColor,
      });

      if (!IS_DRY_RUN) {
        await db
          .update(products)
          .set({ siteArticle: newSiteArticle, colorName: newColor })
          .where(eq(products.id, product.id));
      }
      changesCount++;
    }
  }

  if (IS_DRY_RUN) {
    console.log(
      "\n⚠️ ВНИМАНИЕ: Это тестовый прогон (DRY RUN). База данных НЕ изменена.",
    );
    console.log(`Будет обновлено товаров: ${plan.length}`);
    console.table(plan);
    console.log(
      "\n👉 Если всё выглядит верно, измени IS_DRY_RUN = false в коде и запусти скрипт снова.",
    );
  } else {
    console.log(
      `\n✅ Успех! Обновлено товаров: ${changesCount}. База нормализована.`,
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Ошибка миграции:", err);
  process.exit(1);
});
