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
import { orders } from "../db/schema/orders.schema";
import { products, categories } from "../db/schema";
import { eq } from "drizzle-orm";

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
    return { success: true };
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
      return { success: false, error: "Слишком много запросов. Подождите." };
    }

    const { name, phone, email, message, skus, deliveryMethod, paymentMethod } =
      parsed.data;

    await db.transaction(async (tx) => {
      // 1. Блокируем строки и стягиваем полные данные для Snapshot'а
      const dbItems = await tx
        .select({
          id: discountItems.id,
          uniqueSku: discountItems.uniqueSku,
          status: discountItems.status,
          price: discountItems.discountPrice,
          siteArticle: products.siteArticle,
          categoryName: categories.titleRu,
        })
        .from(discountItems)
        .innerJoin(products, eq(discountItems.productId, products.id))
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(inArray(discountItems.uniqueSku, skus))
        .for("update");

      if (dbItems.length !== skus.length) {
        throw new Error("Некоторые товары не найдены. Обновите корзину.");
      }
      if (dbItems.some((i) => i.status !== "available")) {
        throw new Error("Один или несколько товаров уже забронированы.");
      }

      // 2. Создаем Snapshot и считаем сумму
      let totalAmount = 0;
      const snapshotItems = dbItems.map((item) => {
        totalAmount += item.price;
        return {
          uniqueSku: item.uniqueSku,
          siteArticle: item.siteArticle,
          categoryName: item.categoryName,
          price: item.price,
        };
      });

      // 3. Резервируем физические товары
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
            dbItems.map((i) => i.id),
          ),
        );

      // 4. Записываем заказ в НОВУЮ таблицу
      await tx.insert(orders).values({
        name,
        phone,
        email,
        message,
        deliveryMethod,
        paymentMethod,
        deliveryDetails:
          deliveryMethod === "delivery"
            ? {
                address: parsed.data.address,
                apartment: parsed.data.apartment,
                entrance: parsed.data.entrance,
                floor: parsed.data.floor,
                intercom: parsed.data.intercom,
                courierComment: parsed.data.courierComment,
              }
            : {},
        items: snapshotItems,
        totalAmount,
        ipHash: rateLimit.ipHash,
      });
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("забронированы")) {
      return { success: false, error: error.message, payload: data };
    }
    return {
      success: false,
      error: "Внутренняя ошибка сервера",
      payload: data,
    };
  }
}
