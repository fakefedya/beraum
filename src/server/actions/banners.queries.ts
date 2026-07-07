"use server";

import { desc, sql } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { slides } from "@/src/server/db/schema";
import { z } from "zod";
import { env } from "@/src/lib/env";

const tagSchema = z.object({
  xPercent: z.number().min(0).max(100),
  yPercent: z.number().min(0).max(100),
  title: z.string().min(1),
  subtitle: z.string(),
  href: z.string().regex(/^\//, "Только относительные ссылки (XSS protection)"),
});

const slidePayloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("promo_product"),
    tags: z.array(tagSchema).max(5),
  }),
  z.object({
    type: z.literal("promo_information"),
    title: z.string(),
    description: z.string(),
    buttonText: z.string(),
    href: z.string().regex(/^\//),
  }),
]);

export type ValidatedSlide = z.infer<typeof slidePayloadSchema> & {
  id: string;
  imageUrl: string;
  mobileImageUrl?: string;
};

export async function getActiveSlides(
  placement: "home_hero" | "catalog_hero" = "home_hero",
) {
  try {
    const activeSlides = await db
      .select()
      .from(slides)
      .where(
        sql`${slides.isActive} = true AND ${slides.placement} = ${placement}`,
      )
      .orderBy(desc(slides.sortOrder))
      .limit(10);

    const validSlides: ValidatedSlide[] = [];

    for (const slide of activeSlides) {
      const parsed = slidePayloadSchema.safeParse({
        type: slide.type,
        ...((slide.payload as object) || {}),
      });

      if (parsed.success) {
        const baseUrl = `http://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${slide.bucketName}`;
        validSlides.push({
          ...parsed.data,
          id: slide.id,
          imageUrl: `${baseUrl}/${slide.fileKey}`,
          mobileImageUrl: slide.mobileFileKey
            ? `${baseUrl}/${slide.mobileFileKey}`
            : undefined,
        });
      } else {
        console.error(
          `🚨 Ошибка валидации слайда ${slide.id}:`,
          parsed.error.format(),
        );
      }
    }

    return { success: true, data: validSlides };
  } catch (error) {
    console.error("❌ Ошибка Server Action (getActiveSlides):", error);
    return { success: false, data: [] };
  }
}
