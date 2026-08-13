"use server";

import { headers } from "next/headers";
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../services/s3/client";
import { z } from "zod";

// --- SECURITY: Изолированный Rate Limiter для генерации ссылок ---
const mediaRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 минута
const MAX_REQUESTS = 15; // Даем запас: до 5 файлов + потенциальные ретраи

// Очистка памяти для предотвращения OOM
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of mediaRateLimitMap.entries()) {
    if (now > record.resetAt) {
      mediaRateLimitMap.delete(ip);
    }
  }
}, 300000);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "application/pdf",
]);

const getPresignedUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().refine((val) => ALLOWED_MIME_TYPES.has(val), {
    message: "Недопустимый тип файла",
  }),
  fileSize: z.number().max(MAX_FILE_SIZE, "Файл превышает лимит в 50 МБ"),
});

export async function getPresignedUploadUrl(rawData: unknown) {
  try {
    const parsed = getPresignedUrlSchema.safeParse(rawData);
    if (!parsed.success) {
      // Исправлено: обращаемся к issues
      return { success: false, error: parsed.error.issues[0].message };
    }

    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip =
      realIp ||
      (forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1");

    // Исправлено: Node.js crypto теперь импортирован корректно
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    const now = Date.now();
    const record = mediaRateLimitMap.get(ipHash);

    if (record && now < record.resetAt) {
      if (record.count >= MAX_REQUESTS) {
        return {
          success: false,
          error: "Слишком много запросов. Подождите минуту.",
        };
      }
      record.count += 1;
    } else {
      mediaRateLimitMap.set(ipHash, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      });
    }

    const { filename, contentType } = parsed.data;

    // Security: Генерируем UUID, чтобы не допустить перезаписи файлов (Path Traversal / Collision)
    const ext = filename.split(".").pop();
    const secureFilename = `${crypto.randomUUID()}.${ext}`;
    const fileKey = `requests/${new Date().toISOString().split("T")[0]}/${secureFilename}`;

    const command = new PutObjectCommand({
      Bucket: "support-media",
      Key: fileKey,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return {
      success: true,
      url: signedUrl,
      fileKey,
    };
  } catch (error) {
    console.error("❌ Ошибка генерации Presigned URL:", error);
    return { success: false, error: "Ошибка инициализации загрузки" };
  }
}
