"use server";

import { headers } from "next/headers";
import crypto from "crypto";
import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { partnershipSchema } from "@/src/lib/validations/feedback";

// Simple in-memory rate limiting (В идеале заменить на Redis при масштабировании)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 минута
const MAX_REQUESTS = 3;

export async function submitPartnershipAction(rawData: unknown) {
  try {
    // 1. Zod Validation
    const parsed = partnershipSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: "Некорректные данные формы." };
    }

    const { name, phone, email, company, message } = parsed.data;

    // 2. Security: Rate Limiting
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : realIp || "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    const now = Date.now();
    const record = rateLimitMap.get(ipHash);

    if (record && now < record.resetAt) {
      if (record.count >= MAX_REQUESTS) {
        return {
          success: false,
          error: "Слишком много запросов. Подождите минуту.",
        };
      }
      record.count += 1;
    } else {
      rateLimitMap.set(ipHash, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      });
    }

    // 3. Database Insert
    await db.insert(feedbackRequests).values({
      type: "partnership",
      name,
      phone,
      email,
      message,
      payload: company ? { companyOrInn: company } : {},
      ipHash,
    });

    // TODO: Здесь можно добавить триггер на отправку Email (Resend) или Telegram

    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка сохранения заявки:", error);
    return {
      success: false,
      error: "Внутренняя ошибка сервера. Повторите позже.",
    };
  }
}
