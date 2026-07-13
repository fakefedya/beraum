// src/server/db/seed.ts
import fs from "node:fs";
import path from "node:path";
import { db } from "./client";
import { categories, products } from "./schema";

// Строгий словарь для нормализации слэгов
const SLUG_MAP: Record<string, string> = {
  hob: "hob",
  hood: "hood",
  oven: "oven",
  fridge: "refrigerator", // Нормализуем исходный 'fridge'
  freezer: "freezer",
  dishwasher: "dishwasher",
  microwave: "microwave",
  aerogrill: "air-fryer", // Нормализуем исходный 'aerogrill'
  thermopot: "water-dispenser", // Нормализуем исходный 'thermopot'
  "carbon-filter": "carbon-filter",
  "dish-warmer": "dish-warmer",
};

async function main() {
  console.log("🌱 Начинаем сидирование базы данных...");

  const dataPath = path.resolve(process.cwd(), "dataExample.json");
  if (!fs.existsSync(dataPath)) {
    throw new Error("❌ Файл dataExample.json не найден в корне проекта!");
  }

  const rawData = fs.readFileSync(dataPath, "utf-8");
  const items = JSON.parse(rawData);

  console.log(`📦 Найдено товаров в JSON: ${items.length}`);

  // 1. Нормализуем и создаем категории
  const uniqueCategories = new Map<string, string>(); // Map<NewSlug, TitleRu>

  for (const item of items) {
    if (item.itemCategory) {
      // Ищем новый слаг в словаре, если нет — оставляем как есть (fallback)
      const normalizedSlug = SLUG_MAP[item.itemCategory] || item.itemCategory;

      if (!uniqueCategories.has(normalizedSlug)) {
        uniqueCategories.set(normalizedSlug, item.itemCategoryRu);
      }
    }
  }

  const categoryDbMap = new Map<string, string>(); // Map<NewSlug, UUID>

  for (const [slug, titleRu] of uniqueCategories.entries()) {
    const [inserted] = await db
      .insert(categories)
      .values({ slug, titleRu })
      .returning({ id: categories.id });

    categoryDbMap.set(slug, inserted.id);
  }

  // 2. Подготавливаем товары
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productsToInsert = items.map((item: any) => {
    const spec = item.itemSpecification?.[0] || {};
    const filters = item.itemFilters?.[0] || {};
    const weightString = spec["Вес, г"];
    const weightNetto = weightString
      ? parseInt(String(weightString).replace(/\D/g, ""), 10)
      : null;

    let status: "draft" | "published" | "archived" = "draft";
    if (item.itemArchive === "Да") status = "archived";
    else if (item.isDisplayed) status = "published";

    // Получаем нормализованный слаг для поиска правильного UUID категории
    const normalizedSlug = SLUG_MAP[item.itemCategory] || item.itemCategory;

    return {
      categoryId: categoryDbMap.get(normalizedSlug),
      siteArticle: item.siteArticle,
      itemArticle: item.itemArticle,
      status,
      isLatest: item.itemLatest === "Да",
      wbDiscountedPrice: item.itemPrice || 0,
      manualStock: item.itemStockManual || null,
      ozonLink: item.itemLinks?.[0]?.ozon || null,
      wbLink: item.itemLinks?.[0]?.wildberries || null,
      weightNetto,
      filters,
      specifications: spec,
    };
  });

  // 3. Вставка
  console.log("🚀 Загружаем товары в базу...");
  await db.insert(products).values(productsToInsert);

  console.log("✅ Сидирование успешно завершено!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Ошибка при сидировании:", err);
  process.exit(1);
});
