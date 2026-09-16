"use server";

import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { checkRateLimit } from "@/src/server/utils/rate-limit";
import {
  discountCartSchema,
  wholesaleSchema,
} from "@/src/lib/validations/feedback";
import type { ActionState } from "./feedback";
import { generateTicketNumber } from "../utils/ticket";
import { discountItems } from "../db/schema/discount.schema";
import { inArray, eq } from "drizzle-orm";
import { orders } from "../db/schema/orders.schema";
import { products, categories } from "../db/schema";
import { after } from "next/server";
import {
  sendOrderClientEmail,
  sendAdminNotificationEmail,
} from "../services/mail/client";

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

    const ticketNumber = generateTicketNumber();

    await db.insert(feedbackRequests).values({
      ticketNumber,
      type: "wholesale",
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      message: parsed.data.message,
      payload: {
        city: parsed.data.city,
        techType: parsed.data.techType,
        source: "discount_page",
      },
      ipHash: rateLimit.ipHash,
      consentAt: new Date(),
    });

    // 🛡️ Фоновая отправка в пул поддержки
    after(async () => {
      const TECH_TYPE_LABELS: Record<string, string> = {
        both: "Обе категории",
        working: "Исправный дисконт (СПб)",
        broken: "Неисправный дисконт (МСК / СПб)",
      };

      try {
        await sendAdminNotificationEmail(
          "support",
          `Новая заявка на Опт #${ticketNumber}`,
          {
            Имя: parsed.data.name,
            Телефон: parsed.data.phone,
            Email: parsed.data.email,
            Город: parsed.data.city,
            Категория:
              TECH_TYPE_LABELS[String(parsed.data.techType)] ||
              String(parsed.data.techType),
            Комментарий: parsed.data.message || "—",
          },
        );
      } catch (err) {
        console.error("❌ Фоновая отправка письма по опту не удалась:", err);
      }
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

    let totalAmount = 0;

    const { newOrder, orderItems } = await db.transaction(async (tx) => {
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

      const snapshotItems = dbItems.map((item) => {
        totalAmount += item.price;
        return {
          uniqueSku: item.uniqueSku,
          siteArticle: item.siteArticle,
          categoryName: item.categoryName,
          price: item.price,
        };
      });

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

      const [insertedOrder] = await tx
        .insert(orders)
        .values({
          name,
          phone,
          email,
          message,
          deliveryMethod,
          paymentMethod,
          // 🛡️ Строгий Type Guard для сужения типа Zod-схемы
          deliveryDetails:
            parsed.data.deliveryMethod === "delivery"
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
        })
        .returning({ id: orders.id, orderNumber: orders.orderNumber });

      return { newOrder: insertedOrder, orderItems: snapshotItems };
    });

    after(async () => {
      try {
        await sendOrderClientEmail(
          email,
          name,
          newOrder.orderNumber,
          totalAmount,
          orderItems,
        );

        // 🛡️ Строгий Type Guard при формировании адреса
        const addressString =
          parsed.data.deliveryMethod === "delivery"
            ? [
                parsed.data.address,
                parsed.data.apartment ? `кв. ${parsed.data.apartment}` : null,
                parsed.data.entrance ? `под. ${parsed.data.entrance}` : null,
                parsed.data.floor ? `эт. ${parsed.data.floor}` : null,
                parsed.data.intercom ? `дом. ${parsed.data.intercom}` : null,
              ]
                .filter(Boolean)
                .join(", ")
            : "Самовывоз";

        const productsList = orderItems
          .map((item) => `${item.uniqueSku} (${item.siteArticle})`)
          .join("\n");

        await sendAdminNotificationEmail(
          "orders",
          `Новый заказ Дисконта: #${newOrder.orderNumber}`,
          {
            Имя: name,
            Телефон: phone,
            Email: email,
            Сумма: `${totalAmount.toLocaleString("ru-RU")} ₽`,
            "Способ оплаты":
              paymentMethod === "card" ? "Карта (при получении)" : "Наличные",
            "Тип получения":
              deliveryMethod === "delivery" ? "Доставка" : "Самовывоз",
            "Адрес доставки":
              parsed.data.deliveryMethod === "delivery"
                ? addressString
                : undefined,
            // 🛡️ Обращение к специфичному полю только через дискриминант
            "Комментарий курьеру":
              parsed.data.deliveryMethod === "delivery"
                ? parsed.data.courierComment
                : undefined,
            "Комментарий к заказу": message,
            "Товары (SKU)": productsList,
          },
        );
      } catch (err) {
        console.error("❌ Фоновая отправка писем заказа не удалась:", err);
      }
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
