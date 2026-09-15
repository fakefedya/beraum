"use server";

import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Public } from "../services/s3/client";
import { requireAuthRole } from "../utils/auth-check";
import { inArray } from "drizzle-orm";
import { discountItems } from "../db/schema/discount.schema";

const REQUEST_MEDIA_KEY_REGEX =
  /^requests\/\d{4}-\d{2}-\d{2}\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.[a-z0-9]+$/;

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "in_progress", "resolved"]),
});

export async function updateRequestStatus(formData: FormData) {
  try {
    await requireAuthRole(["superadmin", "admin", "support"]);

    const rawId = formData.get("id");
    const rawStatus = formData.get("status");

    const parsed = updateStatusSchema.safeParse({
      id: rawId,
      status: rawStatus,
    });
    if (!parsed.success) return { success: false, error: "INVALID_DATA" };

    const { id, status } = parsed.data;

    await db
      .update(feedbackRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(feedbackRequests.id, id));

    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error) {
    return { success: false, error: "DB_ERROR" };
  }
}

export async function getMediaUrlsAction(keys: string[]) {
  await requireAuthRole(["superadmin", "admin", "support"]);
  if (!keys || keys.length === 0) return [];

  try {
    const urls = await Promise.all(
      keys.map(async (key) => {
        if (!REQUEST_MEDIA_KEY_REGEX.test(key)) {
          throw new Error("INVALID_KEY_FORMAT");
        }

        const command = new GetObjectCommand({
          Bucket: "support-media",
          Key: key,
        });

        const url = await getSignedUrl(s3Public, command, { expiresIn: 3600 });
        return { key, url };
      }),
    );

    return urls;
  } catch (error) {
    return [];
  }
}

export async function processDiscountOrderAction(
  requestId: string,
  actionType: "confirm" | "cancel",
) {
  try {
    await requireAuthRole(["superadmin", "admin", "manager"]);

    if (!z.string().uuid().safeParse(requestId).success) {
      return { success: false, error: "INVALID_ID" };
    }

    await db.transaction(async (tx) => {
      // 1. Блокируем заявку от параллельных изменений
      const [req] = await tx
        .select()
        .from(feedbackRequests)
        .where(eq(feedbackRequests.id, requestId))
        .for("update");

      if (!req || req.type !== "discount_order") {
        throw new Error("Заявка не найдена или имеет неверный тип");
      }
      if (req.status === "resolved") {
        throw new Error("Эта заявка уже обработана");
      }

      // Безопасный парсинг JSONB без any
      const payload = req.payload as Record<string, unknown>;
      const skus = Array.isArray(payload.skus) ? payload.skus.map(String) : [];

      if (skus.length === 0) {
        throw new Error("В заявке не найдены привязанные товары (SKU)");
      }

      // 2. Обновляем статус физических товаров в каталоге
      if (actionType === "confirm") {
        await tx
          .update(discountItems)
          .set({ status: "sold", updatedAt: new Date() })
          .where(inArray(discountItems.uniqueSku, skus));
      } else if (actionType === "cancel") {
        await tx
          .update(discountItems)
          .set({
            status: "available",
            reservedAt: null, // Снимаем бронь
            updatedAt: new Date(),
          })
          .where(inArray(discountItems.uniqueSku, skus));
      }

      // 3. Закрываем заявку
      await tx
        .update(feedbackRequests)
        .set({ status: "resolved", updatedAt: new Date() })
        .where(eq(feedbackRequests.id, requestId));
    });

    // Сбрасываем кэш во всех связанных разделах
    revalidatePath("/dashboard/requests");
    revalidatePath("/dashboard/discount-products");
    revalidatePath("/discount");

    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка processDiscountOrderAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Внутренняя ошибка",
    };
  }
}
