"use server";

import crypto from "crypto";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { s3Public } from "../services/s3/client";
import { z } from "zod";
import { SUPPORT_MEDIA_CONFIG } from "@/src/lib/constants";
import { MIME_TO_EXT } from "@/src/lib/constants/uploads";
import { checkRateLimit } from "../utils/rate-limit";

const MAX_FILE_SIZE = SUPPORT_MEDIA_CONFIG.MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set<string>(
  SUPPORT_MEDIA_CONFIG.ALLOWED_MIME_TYPES,
);

const getPresignedUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z
    .string()
    .transform((v) => v.toLowerCase())
    .refine((v) => ALLOWED_MIME_TYPES.has(v), {
      message: "Недопустимый тип файла",
    }),
  fileSize: z
    .number()
    .max(
      MAX_FILE_SIZE,
      `Файл превышает лимит в ${SUPPORT_MEDIA_CONFIG.MAX_SIZE_MB} МБ`,
    ),
});

export async function getPresignedUploadUrl(rawData: unknown) {
  try {
    const parsed = getPresignedUrlSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // 🛡️ SECURITY FIX: Лимит 5 загрузок в минуту на IP
    const rateLimit = await checkRateLimit("media_upload", 5, 60000);
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Превышен лимит запросов на загрузку. Подождите минуту.",
      };
    }

    const { contentType } = parsed.data;

    const ext = MIME_TO_EXT[contentType];
    if (!ext) {
      return {
        success: false,
        error: "Не удалось определить безопасное расширение файла",
      };
    }

    const secureFilename = `${crypto.randomUUID()}.${ext}`;
    const fileKey = `requests/${new Date().toISOString().split("T")[0]}/${secureFilename}`;

    const { url, fields } = await createPresignedPost(s3Public, {
      Bucket: "support-media",
      Key: fileKey,
      Conditions: [
        ["content-length-range", 1, MAX_FILE_SIZE],
        ["eq", "$Content-Type", contentType],
      ],
      Fields: {
        "Content-Type": contentType,
      },
      Expires: 300,
    });

    return {
      success: true,
      url,
      fields,
      fileKey,
    };
  } catch (error) {
    console.error("❌ Ошибка генерации Presigned POST URL:", error);
    return { success: false, error: "Ошибка инициализации загрузки" };
  }
}
