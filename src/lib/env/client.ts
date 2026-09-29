import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_STORAGE_URL: z.string().url(),
  NEXT_PUBLIC_YM_COUNTER_ID: z
    .string()
    .regex(/^\d{7,10}$/, "Некорректный ID счетчика Яндекс Метрики")
    .optional(), // Опционально для dev/ci, обязательно для prod
});

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_STORAGE_URL: process.env.NEXT_PUBLIC_STORAGE_URL,
});

if (!parsed.success) {
  console.error("❌ КРИТИЧЕСКАЯ ОШИБКА КЛИЕНТСКОГО ОКРУЖЕНИЯ:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  throw new Error("Невалидные клиентские переменные окружения");
}

export const clientEnv = parsed.data;
