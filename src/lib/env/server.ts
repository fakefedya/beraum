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

  // 🛡️ SECURITY: Ключ для HMAC хеширования IP-адресов
  IP_HASH_SALT: z.string().min(32, {
    error:
      "IP_HASH_SALT должен быть не менее 32 символов (используй openssl rand -hex 32)",
  }),

  // MinIO
  S3_INTERNAL_URL: z.url({ error: "S3_INTERNAL_URL должен быть валидным URL" }),
  S3_PUBLIC_URL: z.url({ error: "S3_PUBLIC_URL должен быть валидным URL" }),
  MINIO_ACCESS_KEY: z.string().min(1, { error: "Ключ доступа обязателен" }),
  MINIO_SECRET_KEY: z.string().min(1, { error: "Секретный ключ обязателен" }),

  // Маркетплейсы
  OZON_CLIENT_ID: z.string().optional(),
  OZON_API_KEY: z.string().optional(),
  WB_API_KEY: z.string().optional(),

  // Почта
  SMTP_HOST: z.string().min(1, "SMTP_HOST обязателен"),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().min(1, "SMTP_USER обязателен"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS обязателен"),
  SMTP_FROM: z.string().min(1, "SMTP_FROM обязателен"),

  // Крон-задачи
  CRON_SECRET: z
    .string()
    .min(16, { error: "Секрет для cron должен быть надежным" })
    .optional(),
});

// Экспортируем результат самовызывающейся функции
export const serverEnv = (() => {
  // Архитектурный флаг обхода валидации при сборке Docker-образа
  if (process.env.SKIP_ENV_VALIDATION === "1") {
    return process.env as unknown as z.infer<typeof serverSchema>;
  }

  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ КРИТИЧЕСКАЯ ОШИБКА СЕРВЕРНОГО ОКРУЖЕНИЯ:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error("Невалидные серверные переменные окружения");
  }

  return parsed.data;
})();
