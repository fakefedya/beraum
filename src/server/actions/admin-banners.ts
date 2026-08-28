"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { slides, users } from "@/src/server/db/schema";
import { auth } from "@/src/lib/auth/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { s3Public } from "@/src/server/services/s3/client";
import { MIME_TO_EXT } from "@/src/lib/constants/uploads";
import crypto from "crypto";

const BUCKET = "system-assets";
const UPLOAD_DIR = "components/banners";

const presignedUrlSchema = z.object({
  contentType: z
    .string()
    .refine(
      (v) => Object.keys(MIME_TO_EXT).includes(v),
      "Запрещенный тип файла",
    ),
  fileSize: z
    .number()
    .max(10 * 1024 * 1024, "Размер файла не должен превышать 10MB"),
});

const tagSchema = z.object({
  xPercent: z.coerce.number().min(0).max(100),
  yPercent: z.coerce.number().min(0).max(100),
  title: z.string().min(1, "Требуется заголовок").trim(),
  subtitle: z.string().trim(),
  href: z
    .string()
    .regex(/^\//, "Только относительные ссылки (защита от XSS)")
    .trim(),
});

const bannerSchema = z
  .object({
    id: z.string().uuid().optional(),
    internalTitle: z.string().min(1).trim(),
    placement: z.enum(["home_hero", "catalog_hero"]),
    fileKey: z.string().min(1, "Требуется ключ файла"),
    mobileFileKey: z.string().optional(),
    isActive: z
      .preprocess((val) => val === "true" || val === true, z.boolean())
      .default(true),
    sortOrder: z.coerce.number().default(0),
  })
  .and(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("promo_product"),
        payload: z.object({ tags: z.array(tagSchema).max(5) }),
      }),
      z.object({
        type: z.literal("promo_information"),
        payload: z.object({
          title: z.string().min(1).trim(),
          description: z.string().trim(),
          buttonText: z.string().min(1).trim(),
          href: z.string().regex(/^\//).trim(),
        }),
      }),
    ]),
  );

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Не авторизован");
  const [dbUser] = await db
    .select({ role: users.role, isLocked: users.isLocked })
    .from(users)
    .where(eq(users.id, session.user.id));
  if (
    !dbUser ||
    dbUser.isLocked ||
    !["superadmin", "manager"].includes(dbUser.role)
  ) {
    throw new Error("Доступ запрещен");
  }
}

export async function upsertBannerAction(formData: FormData) {
  await verifyAdmin();
  const rawData = Object.fromEntries(formData.entries());

  // Парсим вложенный JSON payload
  try {
    if (typeof rawData.payload === "string") {
      rawData.payload = JSON.parse(rawData.payload);
    }
  } catch {
    return { success: false, error: "Невалидный формат JSON payload" };
  }

  const parsed = bannerSchema.safeParse(rawData);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  try {
    if (parsed.data.id) {
      await db
        .update(slides)
        .set({
          ...parsed.data,
          updatedAt: new Date(),
        })
        .where(eq(slides.id, parsed.data.id));
    } else {
      await db.insert(slides).values({
        ...parsed.data,
      });
    }

    revalidateTag("slides", { expire: 0 });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка записи баннера:", error);
    return { success: false, error: "Ошибка БД" };
  }
}

export async function deleteBannerAction(id: string) {
  await verifyAdmin();
  if (!z.string().uuid().safeParse(id).success)
    return { success: false, error: "Невалидный ID" };

  try {
    await db.delete(slides).where(eq(slides.id, id));
    revalidateTag("slides", { expire: 0 });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Ошибка при удалении" };
  }
}

export async function getBannerPresignedUploadUrl(rawData: unknown) {
  await verifyAdmin();
  const parsed = presignedUrlSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { contentType, fileSize } = parsed.data;
  const ext = MIME_TO_EXT[contentType];
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const s3Key = `${UPLOAD_DIR}/${fileName}`;

  try {
    const { url, fields } = await createPresignedPost(s3Public, {
      Bucket: BUCKET,
      Key: s3Key,
      Conditions: [
        ["content-length-range", 1, fileSize],
        ["eq", "$Content-Type", contentType],
      ],
      Fields: { "Content-Type": contentType },
      Expires: 300, // Ссылка живет 5 минут
    });

    // Возвращаем fileName, так как в БД мы храним только имя файла без пути
    return { success: true, url, fields, fileName };
  } catch (error) {
    console.error("❌ S3 Presign Error:", error);
    return { success: false, error: "Ошибка инициализации загрузки" };
  }
}
