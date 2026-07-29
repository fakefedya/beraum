import fs from "node:fs";
import path from "node:path";
import { db } from "./client";
import { categories, products, productMedia, slides } from "./schema";

function toCamelCaseKey(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 🛡️ Исправленный маппер: конвертирует ключи и парсит даты для timestamp-полей
function mapSeedData(items: unknown[]): Record<string, unknown>[] {
  if (!Array.isArray(items)) return [];

  const result: Record<string, unknown>[] = [];

  for (const item of items) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      continue;
    }

    const mappedItem: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(item)) {
      const camelKey = toCamelCaseKey(key);

      // Если ключ похож на дату и значение — строка, преобразуем в Date
      if (
        (camelKey.endsWith("At") ||
          camelKey === "createdAt" ||
          camelKey === "updatedAt") &&
        typeof value === "string"
      ) {
        mappedItem[camelKey] = new Date(value);
      } else {
        mappedItem[camelKey] = value;
      }
    }
    result.push(mappedItem);
  }

  return result;
}

// Обновленный парсер файлов
function readSeedData(filename: string): Record<string, unknown>[] {
  const filePath = path.resolve(process.cwd(), "src/server/db/data", filename);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Файл ${filename} не найден, пропускаем...`);
    return [];
  }

  try {
    const rawData = fs.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(rawData);

    return mapSeedData(parsedData);
  } catch (error) {
    console.error(`❌ Ошибка парсинга файла ${filename}:`, error);
    return [];
  }
}

async function main() {
  console.log("🌱 Начинаем сидирование базы данных из JSON-манифестов...");

  // 1. Читаем данные
  const categoriesData = readSeedData("categories.json");
  const productsData = readSeedData("products.json");
  const mediaData = readSeedData("product_media.json");
  const slidesData = readSeedData("slides.json");

  // 2. Атомарная транзакция вставки
  try {
    await db.transaction(async (tx) => {
      // Таблицы без внешних ключей
      if (categoriesData.length > 0) {
        console.log(`📦 Загрузка categories: ${categoriesData.length}`);
        await tx
          .insert(categories)
          .values(categoriesData as (typeof categories.$inferInsert)[]);
      }

      if (slidesData.length > 0) {
        console.log(`📦 Загрузка slides: ${slidesData.length}`);
        await tx
          .insert(slides)
          .values(slidesData as (typeof slides.$inferInsert)[]);
      }

      // Таблицы с зависимостями (строгий порядок!)
      if (productsData.length > 0) {
        console.log(`📦 Загрузка products: ${productsData.length}`);
        await tx
          .insert(products)
          .values(productsData as (typeof products.$inferInsert)[]);
      }

      if (mediaData.length > 0) {
        console.log(`📦 Загрузка product_media: ${mediaData.length}`);
        await tx
          .insert(productMedia)
          .values(mediaData as (typeof productMedia.$inferInsert)[]);
      }
    });

    console.log("✅ Сидирование успешно завершено!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Критическая ошибка при транзакции сидирования:", error);
    process.exit(1);
  }
}

main();
