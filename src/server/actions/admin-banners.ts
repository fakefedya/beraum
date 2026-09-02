"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { slides } from "@/src/server/db/schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { MIME_TO_EXT } from "@/src/lib/constants/uploads";
import crypto from "crypto";
import { generatePresignedUrl } from "../services/s3/upload";
import { requireAuthRole } from "../utils/auth-check";

const BUCKET = "system-assets";
const UPLOAD_DIR = "components/banners";

const presignedUrlSchema = z.object({
  contentType: z.string().refine((v) => Object.keys(MIME_TO_EXT).includes(v)),
  fileSize: z.number().max(10 * 1024 * 1024),
});

const safeUrlSchema = z
  .string()
  .trim()
  .startsWith("/", "Только относительные ссылки")
  .refine(
    (s) => !s.startsWith("//"),
    "Protocol-relative ссылки запрещены (XSS/Open Redirect)",
  );

const tagSchema = z.object({
  xPercent: z.coerce.number().min(0).max(100),
  yPercent: z.coerce.number().min(0).max(100),
  mobileXPercent: z.number().min(0).max(100).optional(),
  mobileYPercent: z.number().min(0).max(100).optional(),
  title: z.string().min(1).trim(),
  subtitle: z.string().trim(),
  href: safeUrlSchema,
});

const bannerSchema = z
  .object({
    id: z.string().uuid().optional(),
    internalTitle: z.string().min(1).trim(),
    placement: z.enum(["home_hero", "catalog_hero"]),
    fileKey: z.string().min(1),
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
          href: safeUrlSchema,
        }),
      }),
    ]),
  );

export async function upsertBannerAction(formData: FormData) {
  try {
    await requireAuthRole(["superadmin", "manager"]);
    const rawData = Object.fromEntries(formData.entries());

    try {
      if (typeof rawData.payload === "string")
        rawData.payload = JSON.parse(rawData.payload);
    } catch {
      return { success: false, error: "INVALID_JSON" };
    }

    const parsed = bannerSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: "INVALID_DATA" };

    if (parsed.data.id) {
      await db
        .update(slides)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(slides.id, parsed.data.id));
    } else {
      await db.insert(slides).values({ ...parsed.data });
    }

    revalidateTag("slides", { expire: 0 });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "DB_ERROR" };
  }
}

export async function deleteBannerAction(id: string) {
  try {
    await requireAuthRole(["superadmin", "manager"]);
    if (!z.string().uuid().safeParse(id).success)
      return { success: false, error: "INVALID_ID" };

    await db.delete(slides).where(eq(slides.id, id));
    revalidateTag("slides", { expire: 0 });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "DELETE_FAILED" };
  }
}

export async function getBannerPresignedUploadUrl(rawData: unknown) {
  try {
    await requireAuthRole(["superadmin", "manager"]);
    const parsed = presignedUrlSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: "INVALID_DATA" };

    const { contentType, fileSize } = parsed.data;
    const ext = MIME_TO_EXT[contentType];
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const fileKey = `${UPLOAD_DIR}/${fileName}`;

    const payload = await generatePresignedUrl({
      bucket: BUCKET,
      fileKey,
      contentType,
      fileSize,
    });

    return { success: true, ...payload, fileName };
  } catch (error) {
    return { success: false, error: "URL_GENERATION_FAILED" };
  }
}
