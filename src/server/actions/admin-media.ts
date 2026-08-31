"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { productImages, productDocuments } from "@/src/server/db/schema";
import { auth } from "@/src/lib/auth/auth";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Internal, s3Public } from "@/src/server/services/s3/client";
import { MIME_TO_EXT } from "@/src/lib/constants/uploads";
import crypto from "crypto";
import { revalidateTag } from "next/cache";

const BUCKET = "products";
const FILE_KEY_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.[a-z0-9]+$/;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  if (
    session.user.isLocked ||
    !["superadmin", "manager"].includes(session.user.role)
  ) {
    throw new Error("FORBIDDEN");
  }
  return session.user.id;
}

export async function getProductAssetsAction(productId: string) {
  await requireAdmin();
  if (!z.string().uuid().safeParse(productId).success)
    throw new Error("INVALID_ID");

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
    .refine((v) => Object.keys(MIME_TO_EXT).includes(v), "INVALID_MIME"),
  fileSize: z.number().max(50 * 1024 * 1024),
  productId: z.string().uuid(),
});

export async function getAdminPresignedUploadUrl(rawData: unknown) {
  try {
    await requireAdmin();
    const parsed = getUrlSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: "INVALID_DATA" };

    const { contentType, fileSize, productId } = parsed.data;
    const ext = MIME_TO_EXT[contentType];
    const fileKey = `${productId}/${crypto.randomUUID()}.${ext}`;

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
    return { success: false, error: "URL_GENERATION_FAILED" };
  }
}

const saveImageSchema = z.object({
  productId: z.string().uuid(),
  fileKey: z.string().regex(FILE_KEY_REGEX),
  isCover: z.boolean().default(false),
  imageFit: z.enum(["contain", "cover"]).default("contain"),
});

export async function saveProductImageAction(rawData: unknown) {
  try {
    await requireAdmin();
    const parsed = saveImageSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: "INVALID_DATA" };

    await db.insert(productImages).values({
      productId: parsed.data.productId,
      bucketName: BUCKET,
      fileKey: parsed.data.fileKey,
      isCover: parsed.data.isCover,
      imageFit: parsed.data.imageFit,
    });

    revalidateTag("products", { expire: 0 });
    return { success: true };
  } catch (error) {
    return { success: false, error: "DB_ERROR" };
  }
}

export async function setProductImageCoverAction(
  imageId: string,
  productId: string,
) {
  try {
    await requireAdmin();
    if (
      !z.string().uuid().safeParse(imageId).success ||
      !z.string().uuid().safeParse(productId).success
    ) {
      return { success: false, error: "INVALID_ID" };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(productImages)
        .set({ isCover: false })
        .where(eq(productImages.productId, productId));
      await tx
        .update(productImages)
        .set({ isCover: true })
        .where(eq(productImages.id, imageId));
    });

    revalidateTag("products", { expire: 0 });
    return { success: true };
  } catch (error) {
    return { success: false, error: "DB_ERROR" };
  }
}

const saveDocumentSchema = z.object({
  productId: z.string().uuid(),
  fileKey: z.string().regex(FILE_KEY_REGEX),
  type: z.enum(["user_instruction", "service_instruction", "certificate"]),
  title: z.string().min(1).max(255),
});

export async function saveProductDocumentAction(rawData: unknown) {
  try {
    await requireAdmin();
    const parsed = saveDocumentSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: "INVALID_DATA" };

    await db.insert(productDocuments).values({
      productId: parsed.data.productId,
      bucketName: BUCKET,
      fileKey: parsed.data.fileKey,
      type: parsed.data.type,
      title: parsed.data.title,
    });

    revalidateTag("products", { expire: 0 });
    return { success: true };
  } catch (error) {
    return { success: false, error: "DB_ERROR" };
  }
}

export async function deleteProductAssetAction(
  id: string,
  type: "image" | "document",
) {
  try {
    await requireAdmin();
    if (!z.string().uuid().safeParse(id).success)
      return { success: false, error: "INVALID_ID" };

    const table = type === "image" ? productImages : productDocuments;

    const [asset] = await db
      .select({ fileKey: table.fileKey })
      .from(table)
      .where(eq(table.id, id));

    if (!asset) return { success: false, error: "NOT_FOUND" };

    if (!FILE_KEY_REGEX.test(asset.fileKey)) {
      return { success: false, error: "INVALID_FILE_KEY_FORMAT" };
    }

    await db.delete(table).where(eq(table.id, id));
    await s3Internal.send(
      new DeleteObjectCommand({ Bucket: BUCKET, Key: asset.fileKey }),
    );

    revalidateTag("products", { expire: 0 });
    return { success: true };
  } catch (error) {
    return { success: false, error: "DELETE_FAILED" };
  }
}
