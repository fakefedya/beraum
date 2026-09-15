"use server";

import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { checkRateLimit } from "@/src/server/utils/rate-limit";
import {
  discountCartSchema,
  wholesaleSchema,
} from "@/src/lib/validations/feedback"; // Импорт единой схемы
import type { ActionState } from "./feedback";
import { generateTicketNumber } from "../utils/ticket";
import { discountItems } from "../db/schema/discount.schema";
import { inArray } from "drizzle-orm";

export async function submitWholesaleAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData.entries());

  try {
    const parsed = wholesaleSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[i.path[0].toString()] = i.message;
      });
      return { success: false, fieldErrors, payload: data };
    }

    const rateLimit = await checkRateLimit("wholesale_request", 3, 60000);
    if (!rateLimit.success)
      return {
        success: false,
        error: "Слишком много запросов. Подождите минуту.",
        payload: data,
      };

    // Сохраняем в таблицу с новым типом "wholesale"[cite: 3]
    await db.insert(feedbackRequests).values({
      ticketNumber: generateTicketNumber(),
      type: "wholesale",
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      message: parsed.data.message, // В базовой схеме поле называется message
      payload: {
        city: parsed.data.city,
        techType: parsed.data.techType,
        source: "discount_page",
      },
      ipHash: rateLimit.ipHash,
      consentAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка submitWholesaleAction:", error);
    return {
      success: false,
      error: "Внутренняя ошибка сервера.",
      payload: data,
    };
  }
}

export async function checkoutDiscountCartAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData.entries());

  if (typeof data.botCheck === "string" && data.botCheck.length > 0) {
    return { success: true }; // Honeypot сработал
  }

  try {
    const parsed = discountCartSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[i.path[0].toString()] = i.message;
      });
      return { success: false, fieldErrors, payload: data };
    }

    const rateLimit = await checkRateLimit("discount_checkout", 3, 60000 * 30);
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Слишком много запросов. Подождите.",
        payload: data,
      };
    }

    // TS теперь абсолютно точно знает структуру parsed.data
    const { name, phone, email, message, skus, deliveryMethod, paymentMethod } =
      parsed.data;

    // Безопасная сборка payload для JSONB колонки
    const payloadData: Record<string, unknown> = {
      skus,
      deliveryMethod,
      paymentMethod,
      source: "discount_cart",
    };

    // Если доставка, TS гарантирует наличие этих полей в parsed.data
    if (parsed.data.deliveryMethod === "delivery") {
      payloadData.address = parsed.data.address;
      payloadData.apartment = parsed.data.apartment;
      payloadData.entrance = parsed.data.entrance;
      payloadData.floor = parsed.data.floor;
      payloadData.intercom = parsed.data.intercom;
      payloadData.courierComment = parsed.data.courierComment;
    }

    await db.transaction(async (tx) => {
      // 1. Блокируем строки (FOR UPDATE)
      const items = await tx
        .select({
          id: discountItems.id,
          uniqueSku: discountItems.uniqueSku,
          status: discountItems.status,
        })
        .from(discountItems)
        .where(inArray(discountItems.uniqueSku, skus))
        .for("update");

      if (items.length !== skus.length) {
        throw new Error("Некоторые товары уже проданы. Обновите корзину.");
      }
      if (items.some((i) => i.status !== "available")) {
        throw new Error("Один или несколько товаров только что забронировали.");
      }

      // 2. Перевод в резерв
      await tx
        .update(discountItems)
        .set({
          status: "reserved",
          reservedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          inArray(
            discountItems.id,
            items.map((i) => i.id),
          ),
        );

      // 3. Сохранение лида
      await tx.insert(feedbackRequests).values({
        ticketNumber: generateTicketNumber(),
        type: "discount_order",
        name,
        phone,
        email,
        message,
        payload: payloadData,
        ipHash: rateLimit.ipHash,
        consentAt: new Date(),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка checkoutDiscountCartAction:", error);
    if (error instanceof Error && error.message.includes("забронировали")) {
      return { success: false, error: error.message, payload: data };
    }
    return {
      success: false,
      error: "Внутренняя ошибка сервера",
      payload: data,
    };
  }
}
