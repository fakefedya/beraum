import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!parsed.success) {
  console.error("❌ КРИТИЧЕСКАЯ ОШИБКА КЛИЕНТСКОГО ОКРУЖЕНИЯ:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  throw new Error("Невалидные клиентские переменные окружения");
}

export const clientEnv = parsed.data;
