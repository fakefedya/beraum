import fs from "node:fs";
import path from "node:path";
import { db } from "./client";
import {
  categories,
  products,
  slides,
  productImages,
  productDocuments,
  marketplaceClicks,
} from "./schema";

function toCamelCaseKey(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

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

  const categoriesData = readSeedData("categories.json");
  const productsData = readSeedData("products.json");
  const slidesData = readSeedData("slides.json");

  // Новые манифесты
  const imagesData = readSeedData("product_images.json");
  const documentsData = readSeedData("product_documents.json");
  const clicksData = readSeedData("marketplace_clicks.json");

  try {
    await db.transaction(async (tx) => {
      // 1. Справочники и независимые таблицы
      if (categoriesData.length > 0) {
        console.log(`📦 Загрузка categories: ${categoriesData.length}`);
        await tx
          .insert(categories)
          .values(categoriesData as (typeof categories.$inferInsert)[])
          // 🛡️ Security/Arch: Защита от дубликатов. Если ID существует — игнорируем ошибку и идем дальше
          .onConflictDoNothing();
      }
      if (slidesData.length > 0) {
        console.log(`📦 Загрузка slides: ${slidesData.length}`);
        await tx
          .insert(slides)
          .values(slidesData as (typeof slides.$inferInsert)[])
          .onConflictDoNothing();
      }
      if (clicksData.length > 0) {
        console.log(`📊 Загрузка marketplace_clicks: ${clicksData.length}`);
        await tx
          .insert(marketplaceClicks)
          .values(clicksData as (typeof marketplaceClicks.$inferInsert)[])
          .onConflictDoNothing();
      }

      // 2. Таблицы с FK-зависимостями
      if (productsData.length > 0) {
        console.log(`📦 Загрузка products: ${productsData.length}`);
        await tx
          .insert(products)
          .values(productsData as (typeof products.$inferInsert)[])
          .onConflictDoNothing();
      }
      if (imagesData.length > 0) {
        console.log(`🖼️ Загрузка product_images: ${imagesData.length}`);
        await tx
          .insert(productImages)
          .values(imagesData as (typeof productImages.$inferInsert)[])
          .onConflictDoNothing();
      }
      if (documentsData.length > 0) {
        console.log(`📄 Загрузка product_documents: ${documentsData.length}`);
        await tx
          .insert(productDocuments)
          .values(documentsData as (typeof productDocuments.$inferInsert)[])
          .onConflictDoNothing();
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
