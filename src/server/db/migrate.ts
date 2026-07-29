// src/server/db/migrate.ts
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const runMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "❌ КРИТИЧЕСКАЯ ОШИБКА: DATABASE_URL не найден в окружении.",
    );
  }

  console.log("⏳ Подключение к БД и подготовка окружения...");

  // max: 1 обязателен для запуска DDL-операций
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    // 🛡️ Архитектурный фикс: Гарантируем наличие системных расширений ДО миграций
    console.log("🔧 Проверка системных расширений PostgreSQL (pg_trgm)...");
    await migrationClient`CREATE EXTENSION IF NOT EXISTS pg_trgm;`;

    console.log("⏳ Запуск миграций Drizzle...");
    await migrate(db, { migrationsFolder: "src/server/db/migrations" });

    console.log("✅ Миграции успешно применены!");
  } catch (error) {
    console.error("❌ Ошибка при выполнении миграции:", error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
};

runMigrate();
