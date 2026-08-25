"use server";

import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import {
  consultSchema,
  partnershipSchema,
  supportSchema,
} from "@/src/lib/validations/feedback";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { s3Internal } from "../services/s3/client";
import { checkRateLimit } from "../utils/rate-limit";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  payload?: Record<string, FormDataEntryValue | FormDataEntryValue[]>;
};

// 🛡️ SECURITY: Верификация наличия файлов в бакете перед сохранением ключей
async function keepExistingKeys(keys: string[]): Promise<string[]> {
  const checks = await Promise.all(
    keys.map(async (Key) => {
      try {
        await s3Internal.send(
          new HeadObjectCommand({ Bucket: "support-media", Key }),
        );
        return Key;
      } catch {
        return null;
      }
    }),
  );
  return checks.filter((k): k is string => k !== null);
}

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
      return { success: false, fieldErrors, payload: data };
    }

    const { name, phone, email, message, consent, ...payloadData } =
      parsed.data;

    const rateLimit = await checkRateLimit("partnership", 3, 60000);
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Слишком много запросов. Подождите минуту.",
        payload: data,
      };
    }

    await db.insert(feedbackRequests).values({
      type: "partnership",
      name,
      phone,
      email,
      message,
      payload: payloadData,
      ipHash: rateLimit.ipHash,
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
      consent,
      mediaKeys: validatedMediaKeys,
      ...restPayload
    } = parsed.data;

    const rateLimit = await checkRateLimit("support", 3, 60000);
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Слишком много запросов. Подождите минуту.",
        payload: data,
      };
    }

    const confirmedMediaKeys =
      validatedMediaKeys && validatedMediaKeys.length > 0
        ? await keepExistingKeys(validatedMediaKeys)
        : [];

    await db.insert(feedbackRequests).values({
      type: "support",
      name,
      phone,
      email,
      message,
      payload: {
        ...restPayload,
        mediaKeys: confirmedMediaKeys,
      },
      ipHash: rateLimit.ipHash,
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

export async function submitConsultAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData.entries());

  try {
    const parsed = consultSchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0])
          fieldErrors[issue.path[0].toString()] = issue.message;
      });
      return { success: false, fieldErrors, payload: data };
    }

    const { name, phone, email, message, consent, ...payloadData } =
      parsed.data;

    const rateLimit = await checkRateLimit("consultation", 3, 60000);
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Слишком много запросов. Подождите минуту.",
        payload: data,
      };
    }

    await db.insert(feedbackRequests).values({
      type: "consultation",
      name,
      phone,
      email,
      message,
      payload: { sourcePage: "/", ...payloadData },
      ipHash: rateLimit.ipHash,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка сохранения вопроса:", error);
    return {
      success: false,
      error: "Внутренняя ошибка сервера. Повторите позже.",
      payload: data,
    };
  }
}
