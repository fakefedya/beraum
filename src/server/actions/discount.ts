"use server";

import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { checkRateLimit } from "@/src/server/utils/rate-limit";
import { wholesaleSchema } from "@/src/lib/validations/feedback"; // Импорт единой схемы
import type { ActionState } from "./feedback";
import { generateTicketNumber } from "../utils/ticket";

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
