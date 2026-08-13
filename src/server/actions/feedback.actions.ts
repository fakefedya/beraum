"use server";

import { headers } from "next/headers";
import crypto from "crypto";
import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import {
  partnershipSchema,
  supportSchema,
} from "@/src/lib/validations/feedback";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS = 3;

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 300000);

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  payload?: Record<string, FormDataEntryValue | FormDataEntryValue[]>;
};

export async function submitPartnershipAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData.entries());

  try {
    const parsed = partnershipSchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0])
          fieldErrors[issue.path[0].toString()] = issue.message;
      });

      return {
        success: false,
        fieldErrors,
        payload: data,
      };
    }

    const { name, phone, email, company, message } = parsed.data;

    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip =
      realIp ||
      (forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1");
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    const now = Date.now();
    const record = rateLimitMap.get(ipHash);

    if (record && now < record.resetAt) {
      if (record.count >= MAX_REQUESTS) {
        return {
          success: false,
          error: "Слишком много запросов. Подождите минуту.",
          payload: data,
        };
      }
      record.count += 1;
    } else {
      rateLimitMap.set(ipHash, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      });
    }

    await db.insert(feedbackRequests).values({
      type: "partnership",
      name,
      phone,
      email,
      message,
      payload: company ? { companyOrInn: company } : {},
      ipHash,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка сохранения заявки:", error);
    return {
      success: false,
      error: "Внутренняя ошибка сервера. Повторите позже.",
      payload: data,
    };
  }
}

export async function submitSupportAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data: Record<string, FormDataEntryValue | FormDataEntryValue[]> =
    Object.fromEntries(formData.entries());

  const mediaKeys = formData.getAll("mediaKeys");
  if (mediaKeys.length > 0) {
    data.mediaKeys = mediaKeys;
  }

  try {
    const parsed = supportSchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0])
          fieldErrors[issue.path[0].toString()] = issue.message;
      });
      return { success: false, fieldErrors, payload: data };
    }

    const {
      name,
      phone,
      email,
      message,
      categoryId,
      marketplace,
      purchaseDate,
      modelArticle,
      mediaKeys: validatedMediaKeys,
    } = parsed.data;

    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip =
      realIp ||
      (forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1");
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    const now = Date.now();
    const record = rateLimitMap.get(ipHash);

    if (record && now < record.resetAt) {
      if (record.count >= MAX_REQUESTS) {
        return {
          success: false,
          error: "Слишком много запросов. Подождите минуту.",
          payload: data,
        };
      }
      record.count += 1;
    } else {
      rateLimitMap.set(ipHash, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      });
    }

    await db.insert(feedbackRequests).values({
      type: "support",
      name,
      phone,
      email,
      message,
      // ИЗМЕНЕНИЕ 2: Передаем массив в JSONB
      payload: {
        categoryId,
        marketplace,
        purchaseDate,
        modelArticle,
        mediaKeys: validatedMediaKeys || [],
      },
      ipHash,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка заявки в поддержку:", error);
    return {
      success: false,
      error: "Внутренняя ошибка сервера.",
      payload: data,
    };
  }
}
