"use server";

import { z } from "zod";
import { db } from "@/src/server/db/client";
import { discountItems } from "@/src/server/db/schema/discount.schema";
import type { DiscountMedia } from "@/src/server/db/schema/discount.schema";
import { requireAuthRole } from "@/src/server/utils/auth-check";
import { revalidatePath } from "next/cache";
import { generatePresignedUrl } from "../services/s3/upload";
import crypto from "crypto";
import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Internal } from "../services/s3/client";
import { eq } from "drizzle-orm";
import { getSupportModelsByCategory } from "@/src/server/queries/products";

const UPLOAD_BUCKET = "discount-products";
const MAX_FILES = 15;
const MAX_FILE_SIZE_MB = 10;

const ALLOWED_DISCOUNT_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

const discountMediaSchema = z.object({
  contentType: z
    .string()
    .refine(
      (v): v is keyof typeof ALLOWED_DISCOUNT_MIME =>
        Object.keys(ALLOWED_DISCOUNT_MIME).includes(v),
      "Разрешены только изображения",
    ),
  fileSize: z
    .number()
    .max(
      MAX_FILE_SIZE_MB * 1024 * 1024,
      `Размер файла не должен превышать ${MAX_FILE_SIZE_MB}MB`,
    ),
});

type PresignedUrlResult =
  | { success: false; error: string }
  | {
      success: true;
      url: string;
      fields: Record<string, string>;
      fileKey: string;
    };

export async function getDiscountPresignedUploadUrl(
  rawData: unknown,
): Promise<PresignedUrlResult> {
  try {
    await requireAuthRole(["superadmin", "admin", "manager"]);
    const parsed = discountMediaSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { contentType, fileSize } = parsed.data;
    const ext = ALLOWED_DISCOUNT_MIME[contentType];
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const fileKey = `temp/defects/${new Date().toISOString().split("T")[0]}/${fileName}`;

    const payload = await generatePresignedUrl({
      bucket: UPLOAD_BUCKET,
      fileKey,
      contentType,
      fileSize,
    });

    return { success: true, ...payload, fileKey };
  } catch {
    return { success: false, error: "URL_GENERATION_FAILED" };
  }
}

const mediaPayloadSchema = z.string().transform((val, ctx): DiscountMedia[] => {
  try {
    const parsed = JSON.parse(val);
    const schema = z
      .array(
        z.object({
          key: z
            .string()
            .regex(
              /^(temp\/)?defects\/.*\.(jpg|jpeg|png|webp|avif)$/i,
              "Недопустимый путь файла",
            ),
          isCover: z.boolean(),
          fit: z.enum(["contain", "cover"]),
        }),
      )
      .max(MAX_FILES, `Максимум ${MAX_FILES} фотографий`);
    return schema.parse(parsed);
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Невалидный формат медиа-данных",
    });
    return z.NEVER;
  }
});

const createDiscountItemSchema = z.object({
  productId: z.string().uuid("Некорректный ID базового товара"),
  uniqueSku: z
    .string()
    .min(5, "SKU слишком короткий")
    .max(50, "SKU слишком длинный")
    .regex(
      /^[A-Z0-9-]+$/,
      "Допустимы только заглавные латинские буквы, цифры и дефис",
    ),
  defectDescription: z
    .string()
    .min(10, "Опишите дефект подробнее (минимум 10 символов)")
    .max(1000, "Описание слишком длинное"),
  discountPrice: z.coerce
    .number()
    .int("Цена должна быть целым числом")
    .positive("Цена должна быть больше нуля"),
  mediaPayload: mediaPayloadSchema,
});

export async function createDiscountItemAction(formData: FormData) {
  try {
    await requireAuthRole(["superadmin", "admin", "manager"]);

    const rawData = {
      productId: formData.get("productId"),
      uniqueSku: formData.get("uniqueSku"),
      defectDescription: formData.get("defectDescription"),
      discountPrice: formData.get("discountPrice"),
      mediaPayload: formData.get("mediaPayload") || "[]",
    };

    const parsed = createDiscountItemSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const permanentMedia: DiscountMedia[] = [];

    for (const item of parsed.data.mediaPayload) {
      if (!item.key.startsWith("temp/")) {
        permanentMedia.push(item);
        continue;
      }

      const permKey = item.key.replace(/^temp\//, "");

      await s3Internal.send(
        new CopyObjectCommand({
          Bucket: UPLOAD_BUCKET,
          CopySource: `${UPLOAD_BUCKET}/${item.key}`,
          Key: permKey,
        }),
      );

      await s3Internal.send(
        new DeleteObjectCommand({
          Bucket: UPLOAD_BUCKET,
          Key: item.key,
        }),
      );

      permanentMedia.push({ ...item, key: permKey });
    }

    await db.insert(discountItems).values({
      productId: parsed.data.productId,
      uniqueSku: parsed.data.uniqueSku,
      defectDescription: parsed.data.defectDescription,
      discountPrice: parsed.data.discountPrice,
      mediaKeys: permanentMedia,
      status: "available",
    });

    revalidatePath("/discount");
    revalidatePath("/dashboard/discount-items");

    return { success: true };
  } catch (error: unknown) {
    const isPgError = (err: unknown): err is { code: string } =>
      typeof err === "object" && err !== null && "code" in err;

    if (isPgError(error) && error.code === "23505") {
      return {
        success: false,
        error: "Товар с таким уникальным SKU уже существует",
      };
    }
    return {
      success: false,
      error: "Внутренняя ошибка при создании дисконтного товара",
    };
  }
}

const updateDiscountItemSchema = z.object({
  id: z.string().uuid("Некорректный ID товара"),
  defectDescription: z
    .string()
    .min(10, "Опишите дефект (мин. 10 символов)")
    .max(1000),
  discountPrice: z.coerce
    .number()
    .int()
    .positive("Цена должна быть больше нуля"),
  status: z.enum(["available", "reserved", "sold"]),
  mediaPayload: mediaPayloadSchema,
});

export async function updateDiscountItemAction(formData: FormData) {
  try {
    await requireAuthRole(["superadmin", "admin", "manager"]);

    const rawData = {
      id: formData.get("id"),
      defectDescription: formData.get("defectDescription"),
      discountPrice: formData.get("discountPrice"),
      status: formData.get("status"),
      mediaPayload: formData.get("mediaPayload") || "[]",
    };

    const parsed = updateDiscountItemSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const [existingItem] = await db
      .select({ mediaKeys: discountItems.mediaKeys })
      .from(discountItems)
      .where(eq(discountItems.id, parsed.data.id));

    if (!existingItem) {
      return { success: false, error: "Товар не найден" };
    }

    const permanentMedia: DiscountMedia[] = [];

    for (const item of parsed.data.mediaPayload) {
      if (!item.key.startsWith("temp/")) {
        permanentMedia.push(item);
        continue;
      }
      const permKey = item.key.replace(/^temp\//, "");
      await s3Internal.send(
        new CopyObjectCommand({
          Bucket: UPLOAD_BUCKET,
          CopySource: `${UPLOAD_BUCKET}/${item.key}`,
          Key: permKey,
        }),
      );
      await s3Internal.send(
        new DeleteObjectCommand({ Bucket: UPLOAD_BUCKET, Key: item.key }),
      );
      permanentMedia.push({ ...item, key: permKey });
    }

    const newKeys = permanentMedia.map((m) => m.key);

    const dbMedia = existingItem.mediaKeys as unknown as Array<
      DiscountMedia | string
    >;
    const oldKeys = Array.isArray(dbMedia)
      ? dbMedia.map((m) => (typeof m === "string" ? m : m.key))
      : [];

    const removedKeys = oldKeys.filter((k) => !newKeys.includes(k));
    for (const key of removedKeys) {
      await s3Internal
        .send(new DeleteObjectCommand({ Bucket: UPLOAD_BUCKET, Key: key }))
        .catch(() => {});
    }

    await db
      .update(discountItems)
      .set({
        defectDescription: parsed.data.defectDescription,
        discountPrice: parsed.data.discountPrice,
        status: parsed.data.status,
        mediaKeys: permanentMedia,
        reservedAt: parsed.data.status === "reserved" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(discountItems.id, parsed.data.id));

    revalidatePath("/discount");
    revalidatePath("/dashboard/discount-items");

    return { success: true };
  } catch {
    return { success: false, error: "Ошибка при обновлении товара" };
  }
}

export async function deleteDiscountItemAction(id: string) {
  try {
    await requireAuthRole(["superadmin", "admin", "manager"]);

    const [item] = await db
      .select({ mediaKeys: discountItems.mediaKeys })
      .from(discountItems)
      .where(eq(discountItems.id, id));

    if (item && Array.isArray(item.mediaKeys) && item.mediaKeys.length > 0) {
      const dbMedia = item.mediaKeys as unknown as Array<
        DiscountMedia | string
      >;
      const keysToDelete = dbMedia.map((m) =>
        typeof m === "string" ? m : m.key,
      );

      for (const key of keysToDelete) {
        await s3Internal
          .send(new DeleteObjectCommand({ Bucket: UPLOAD_BUCKET, Key: key }))
          .catch(() => {});
      }
    }

    await db.delete(discountItems).where(eq(discountItems.id, id));

    revalidatePath("/discount");
    revalidatePath("/dashboard/discount-items");
    return { success: true };
  } catch {
    return { success: false, error: "Ошибка при удалении товара" };
  }
}

export async function getModelsByCategoryAction(categoryId: string) {
  try {
    await requireAuthRole(["superadmin", "admin", "manager"]);
    const result = await getSupportModelsByCategory(categoryId);
    return { success: true, data: result.data };
  } catch {
    return { success: false, data: [] };
  }
}
