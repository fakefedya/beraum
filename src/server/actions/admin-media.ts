"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { productImages, productDocuments, users } from "@/src/server/db/schema";
import { auth } from "@/src/lib/auth/auth";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Internal, s3Public } from "@/src/server/services/s3/client";
import { MIME_TO_EXT } from "@/src/lib/constants/uploads";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

const BUCKET = "products";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Не авторизован" };

  const [dbUser] = await db
    .select({ isLocked: users.isLocked, role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (
    !dbUser ||
    dbUser.isLocked ||
    !["superadmin", "manager"].includes(dbUser.role)
  ) {
    return {
      success: false,
      error: "Доступ запрещен или аккаунт заблокирован",
    };
  }
}

export async function getProductAssetsAction(productId: string) {
  await requireAdmin();
  if (!z.string().uuid().safeParse(productId).success)
    throw new Error("Invalid ID");

  const [images, docs] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(productImages.sortOrder),
    db
      .select()
      .from(productDocuments)
      .where(eq(productDocuments.productId, productId)),
  ]);

  return { images, docs };
}

const getUrlSchema = z.object({
  contentType: z
    .string()
    .refine(
      (v) => Object.keys(MIME_TO_EXT).includes(v),
      "Запрещенный тип файла",
    ),
  fileSize: z.number().max(50 * 1024 * 1024, "Максимум 50MB"),
  productId: z.string().uuid(),
});

export async function getAdminPresignedUploadUrl(rawData: unknown) {
  await requireAdmin();
  const parsed = getUrlSchema.safeParse(rawData);
  if (!parsed.success)
    return { success: false, error: "Невалидные метаданные файла" };

  const { contentType, fileSize, productId } = parsed.data;
  const ext = MIME_TO_EXT[contentType];
  const fileKey = `${productId}/${crypto.randomUUID()}.${ext}`;

  try {
    const { url, fields } = await createPresignedPost(s3Public, {
      Bucket: BUCKET,
      Key: fileKey,
      Conditions: [
        ["content-length-range", 1, fileSize],
        ["eq", "$Content-Type", contentType],
      ],
      Fields: { "Content-Type": contentType },
      Expires: 600,
    });

    return { success: true, url, fields, fileKey };
  } catch (error) {
    console.error("S3 Presign Error:", error);
    return { success: false, error: "Ошибка генерации ссылки" };
  }
}

const saveImageSchema = z.object({
  productId: z.string().uuid(),
  fileKey: z.string().min(1),
  isCover: z.boolean().default(false),
  imageFit: z.enum(["contain", "cover"]).default("contain"),
});

export async function saveProductImageAction(rawData: unknown) {
  await requireAdmin();
  const parsed = saveImageSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: "Invalid data" };

  await db.insert(productImages).values({
    productId: parsed.data.productId,
    bucketName: BUCKET,
    fileKey: parsed.data.fileKey,
    isCover: parsed.data.isCover,
    imageFit: parsed.data.imageFit,
  });

  revalidatePath("/", "layout");
  return { success: true };
}

// 🔒 НОВЫЙ ЭКШЕН: Транзакционное назначение обложки
export async function setProductImageCoverAction(
  imageId: string,
  productId: string,
) {
  await requireAdmin();
  try {
    await db.transaction(async (tx) => {
      // 1. Сбрасываем флаг у всех фото этого товара
      await tx
        .update(productImages)
        .set({ isCover: false })
        .where(eq(productImages.productId, productId));

      // 2. Ставим флаг на выбранное фото
      await tx
        .update(productImages)
        .set({ isCover: true })
        .where(eq(productImages.id, imageId));
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Set cover error:", error);
    return { success: false, error: "Ошибка при обновлении обложки" };
  }
}

// 🔒 НОВЫЙ ЭКШЕН: Сохранение документа в БД
const saveDocumentSchema = z.object({
  productId: z.string().uuid(),
  fileKey: z.string().min(1),
  type: z.enum(["user_instruction", "service_instruction", "certificate"]),
  title: z.string().min(1, "Название обязательно").max(255),
});

export async function saveProductDocumentAction(rawData: unknown) {
  await requireAdmin();
  const parsed = saveDocumentSchema.safeParse(rawData);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  try {
    await db.insert(productDocuments).values({
      productId: parsed.data.productId,
      bucketName: BUCKET,
      fileKey: parsed.data.fileKey,
      type: parsed.data.type,
      title: parsed.data.title,
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Save doc error:", error);
    return { success: false, error: "Ошибка записи документа в БД" };
  }
}

export async function deleteProductAssetAction(
  id: string,
  type: "image" | "document",
) {
  await requireAdmin();
  const table = type === "image" ? productImages : productDocuments;

  const [asset] = await db
    .select({ fileKey: table.fileKey })
    .from(table)
    .where(eq(table.id, id));

  if (!asset) return { success: false, error: "Не найдено" };

  try {
    await db.delete(table).where(eq(table.id, id));
    await s3Internal.send(
      new DeleteObjectCommand({ Bucket: BUCKET, Key: asset.fileKey }),
    );

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("S3 Delete Error:", error);
    return { success: false, error: "Ошибка физического удаления файла" };
  }
}
