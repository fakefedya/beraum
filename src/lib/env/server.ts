import "server-only"; // 🔒 Блокируем попадание на клиент
import { z } from "zod";

const serverSchema = z.object({
  // База данных
  DATABASE_URL: z.string().url("DATABASE_URL должна быть валидным URL-адресом"),

  // Auth.js
  AUTH_SECRET: z
    .string()
    .min(15, "AUTH_SECRET слишком короткий для обеспечения безопасности"),

  // MinIO
  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z.string().transform((val) => parseInt(val, 10)),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),

  // Маркетплейсы
  OZON_CLIENT_ID: z.string().min(1),
  OZON_API_KEY: z.string().min(1),

  WB_API_KEY: z.string().min(1),

  // Крон-задачи (добавляем сразу)
  CRON_SECRET: z
    .string()
    .min(16, "Секрет для cron должен быть надежным")
    .optional(),
});

const parsed = serverSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ КРИТИЧЕСКАЯ ОШИБКА СЕРВЕРНОГО ОКРУЖЕНИЯ:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  throw new Error("Невалидные серверные переменные окружения");
}

export const serverEnv = parsed.data;
