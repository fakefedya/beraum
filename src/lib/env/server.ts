import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  // База данных
  DATABASE_URL: z.url({
    error: "DATABASE_URL должна быть валидным URL-адресом",
  }),

  // Auth.js
  AUTH_SECRET: z.string().min(15, {
    error: "AUTH_SECRET слишком короткий для обеспечения безопасности",
  }),

  // MinIO
  S3_INTERNAL_URL: z.url({ error: "S3_INTERNAL_URL должен быть валидным URL" }),
  S3_PUBLIC_URL: z.url({ error: "S3_PUBLIC_URL должен быть валидным URL" }),
  MINIO_ACCESS_KEY: z.string().min(1, { error: "Ключ доступа обязателен" }),
  MINIO_SECRET_KEY: z.string().min(1, { error: "Секретный ключ обязателен" }),

  // Маркетплейсы
  OZON_CLIENT_ID: z.string().min(1, { error: "Ozon Client ID обязателен" }),
  OZON_API_KEY: z.string().min(1, { error: "Ozon API Key обязателен" }),
  WB_API_KEY: z.string().min(1, { error: "WB API Key обязателен" }),

  // Крон-задачи
  CRON_SECRET: z
    .string()
    .min(16, { error: "Секрет для cron должен быть надежным" })
    .optional(),
});

const parsed = serverSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ КРИТИЧЕСКАЯ ОШИБКА СЕРВЕРНОГО ОКРУЖЕНИЯ:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  throw new Error("Невалидные серверные переменные окружения");
}

export const serverEnv = parsed.data;
