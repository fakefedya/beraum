"use server";

import { db } from "@/src/server/db/client";
import {
  feedbackRequests,
  mediaUploads,
} from "@/src/server/db/schema/feedback.schema";
import { categories } from "@/src/server/db/schema";
import {
  consultSchema,
  partnershipSchema,
  supportSchema,
} from "@/src/lib/validations/feedback";
import { checkRateLimit } from "../utils/rate-limit";
import { inArray, and, eq, isNull } from "drizzle-orm";
import { generateTicketNumber } from "../utils/ticket";
import { after } from "next/server";
import {
  sendAdminNotificationEmail,
  sendFeedbackClientEmail,
} from "../services/mail/client";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  payload?: Record<string, FormDataEntryValue | FormDataEntryValue[]>;
};

const MARKETPLACE_LABELS: Record<string, string> = {
  ozon: "Ozon",
  wb: "Wildberries",
  ymarket: "Яндекс Маркет",
  mvideo: "М.Видео",
  megamarket: "МегаМаркет",
  beraum: "Официальный сайт",
  offline: "Офлайн магазин",
};

const CONDITION_LABELS: Record<string, string> = {
  new: "Новая техника",
  used: "ДДисконт техника",
};

const formatDate = (dateString?: unknown) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString as string);
    if (isNaN(date.getTime())) return String(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return String(dateString);
  }
};

async function keepExistingKeys(
  keys: string[],
  ipHash: string,
): Promise<string[]> {
  if (!keys.length) return [];

  const validRecords = await db
    .select({ fileKey: mediaUploads.fileKey })
    .from(mediaUploads)
    .where(
      and(
        inArray(mediaUploads.fileKey, keys),
        eq(mediaUploads.ipHash, ipHash),
        isNull(mediaUploads.claimedBy),
      ),
    );

  return validRecords.map((r) => r.fileKey);
}

// ------------------------------------------------------------------
// B2B СОТРУДНИЧЕСТВО
// ------------------------------------------------------------------
export async function submitPartnershipAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData.entries());

  if (typeof data.botCheck === "string" && data.botCheck.length > 0) {
    console.warn(`[SECURITY] Бот-спам заблокирован через honeypot`);
    return { success: true };
  }

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

    const { name, phone, email, message, consent, botCheck, ...payloadData } =
      parsed.data;

    const rateLimit = await checkRateLimit("partnership", 3, 60000);
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Слишком много запросов. Подождите минуту.",
        payload: data,
      };
    }

    const ticketNumber = generateTicketNumber();

    await db.insert(feedbackRequests).values({
      ticketNumber,
      type: "partnership",
      name,
      phone,
      email,
      message,
      payload: payloadData,
      ipHash: rateLimit.ipHash,
      consentAt: new Date(),
    });

    after(async () => {
      try {
        await sendFeedbackClientEmail(
          email,
          name,
          ticketNumber,
          "Сотрудничество",
        );

        // 🛡️ Строгий маппинг полей
        await sendAdminNotificationEmail(
          "support",
          `Новая заявка на сотрудничество #${ticketNumber}`,
          {
            Имя: name,
            Телефон: phone,
            Email: email,
            "Компания / ИНН": String(payloadData.company || "—"),
            Комментарий: message || "—",
          },
        );
      } catch (err) {
        console.error(
          "❌ Фоновая отправка писем (Partnership) не удалась:",
          err,
        );
      }
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

// ------------------------------------------------------------------
// ТЕХНИЧЕСКАЯ ПОДДЕРЖКА
// ------------------------------------------------------------------
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

  if (typeof data.botCheck === "string" && data.botCheck.length > 0) {
    console.warn(`[SECURITY] Бот-спам заблокирован через honeypot`);
    return { success: true };
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
      botCheck,
      mediaKeys: validatedMediaKeys,
      ...restPayload
    } = parsed.data;

    // Получаем русское название категории из БД для письма
    const [categoryRecord] = await db
      .select({ id: categories.id, titleRu: categories.titleRu })
      .from(categories)
      .where(eq(categories.id, restPayload.categoryId as string))
      .limit(1);

    if (!categoryRecord) {
      return {
        success: false,
        fieldErrors: { categoryId: "Выбранная категория не найдена в базе" },
        payload: data,
      };
    }

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
        ? await keepExistingKeys(validatedMediaKeys, rateLimit.ipHash)
        : [];

    const ticketNumber = generateTicketNumber();

    const [newRequest] = await db
      .insert(feedbackRequests)
      .values({
        ticketNumber,
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
        consentAt: new Date(),
      })
      .returning({ id: feedbackRequests.id });

    if (confirmedMediaKeys.length > 0) {
      await db
        .update(mediaUploads)
        .set({ claimedBy: newRequest.id })
        .where(inArray(mediaUploads.fileKey, confirmedMediaKeys));
    }

    after(async () => {
      try {
        await sendFeedbackClientEmail(
          email,
          name,
          ticketNumber,
          "Сервисная поддержка",
        );

        // 🛡️ Строгий маппинг технических полей
        await sendAdminNotificationEmail(
          "support",
          `Новое обращение в поддержку #${ticketNumber}`,
          {
            Имя: name,
            Телефон: phone,
            Email: email,
            "Категория техники": categoryRecord.titleRu,
            "Артикул / Модель": String(restPayload.modelArticle || "—"),
            "Место покупки":
              MARKETPLACE_LABELS[String(restPayload.marketplace)] ||
              String(restPayload.marketplace || "—"),
            "Дата покупки": formatDate(restPayload.purchaseDate),
            Состояние:
              CONDITION_LABELS[String(restPayload.deviceCondition)] ||
              String(restPayload.deviceCondition || "—"),
            "Адрес нахождения": String(restPayload.address || "—"),
            "Описание проблемы": message || "—",
            "Прикрепленные файлы (S3)":
              confirmedMediaKeys.length > 0
                ? confirmedMediaKeys.join("\n")
                : "Нет файлов",
          },
        );
      } catch (err) {
        console.error("❌ Фоновая отправка писем (Support) не удалась:", err);
      }
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

// ------------------------------------------------------------------
// КОНСУЛЬТАЦИЯ
// ------------------------------------------------------------------
export async function submitConsultAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData.entries());

  if (typeof data.botCheck === "string" && data.botCheck.length > 0) {
    console.warn(`[SECURITY] Бот-спам заблокирован через honeypot`);
    return { success: true };
  }

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

    const { name, phone, email, message, consent, botCheck, ...payloadData } =
      parsed.data;

    const rateLimit = await checkRateLimit("consultation", 3, 60000);
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Слишком много запросов. Подождите минуту.",
        payload: data,
      };
    }

    const ticketNumber = generateTicketNumber();

    await db.insert(feedbackRequests).values({
      ticketNumber,
      type: "consultation",
      name,
      phone,
      email,
      message,
      payload: payloadData,
      ipHash: rateLimit.ipHash,
      consentAt: new Date(),
    });

    after(async () => {
      try {
        await sendFeedbackClientEmail(
          email,
          name,
          ticketNumber,
          "Консультация",
        );

        await sendAdminNotificationEmail(
          "support",
          `Новый вопрос (Консультация) #${ticketNumber}`,
          {
            Имя: name,
            Телефон: phone,
            Email: email,
            "Вопрос / Комментарий": message || "—",
            "Страница отправки": String(payloadData.sourcePage || "—"),
          },
        );
      } catch (err) {
        console.error("❌ Фоновая отправка писем (Consult) не удалась:", err);
      }
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
