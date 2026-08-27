"use server";

import { auth } from "@/src/lib/auth/auth";
import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Public } from "../services/s3/client";

// 🛡️ Security: Строгая валидация входящих данных
const updateStatusSchema = z.object({
  id: z.string().uuid("Некорректный ID заявки"),
  status: z.enum(["new", "in_progress", "resolved"]),
});

export async function updateRequestStatus(formData: FormData) {
  // 1. Авторизация и RBAC
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Не авторизован" };
  }

  const allowedRoles = ["superadmin", "support"];
  if (!allowedRoles.includes(session.user.role)) {
    return { success: false, error: "Недостаточно прав для изменения статуса" };
  }

  // 2. Валидация Payload
  const rawId = formData.get("id");
  const rawStatus = formData.get("status");

  const parsed = updateStatusSchema.safeParse({ id: rawId, status: rawStatus });

  if (!parsed.success) {
    return { success: false, error: "Невалидные данные запроса" };
  }

  const { id, status } = parsed.data;

  // 3. Выполнение транзакции
  try {
    await db
      .update(feedbackRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(feedbackRequests.id, id));

    revalidatePath("/dashboard/requests"); // Инвалидируем кэш роута
    return { success: true };
  } catch (error) {
    console.error("❌ [ACTION] Ошибка обновления статуса:", error);
    return { success: false, error: "Ошибка базы данных" };
  }
}

export async function getMediaUrlsAction(keys: string[]) {
  // 1. Строгая проверка сессии (Zero Trust)
  const session = await auth();
  if (!session?.user) {
    throw new Error("Не авторизован");
  }

  const allowedRoles = ["superadmin", "support"];
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("Недостаточно прав");
  }

  if (!keys || keys.length === 0) return [];

  // 2. Генерация ссылок
  try {
    const urls = await Promise.all(
      keys.map(async (key) => {
        // Защита от Path Traversal: убеждаемся, что ключ не содержит попыток выйти из директории
        const sanitizedKey = key.replace(/\.\.\//g, "");

        const command = new GetObjectCommand({
          Bucket: "support-media",
          Key: sanitizedKey,
        });

        // Ссылка живет ровно 1 час (3600 секунд)
        const url = await getSignedUrl(s3Public, command, { expiresIn: 3600 });
        return { key: sanitizedKey, url };
      }),
    );

    return urls;
  } catch (error) {
    console.error("❌ [ACTION] Ошибка генерации ссылок на медиа:", error);
    return [];
  }
}
