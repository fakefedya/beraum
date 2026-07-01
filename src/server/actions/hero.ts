"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { heroSlides } from "@/src/server/db/schema";
import { z } from "zod";
import { env } from "@/src/lib/env";

// Строгая валидация полезной нагрузки (Zero Trust к БД)
const tagSchema = z.object({
  xPercent: z.number().min(0).max(100),
  yPercent: z.number().min(0).max(100),
  title: z.string().min(1),
  subtitle: z.string(),
  href: z.string().regex(/^\//, "Только относительные ссылки (XSS protection)"),
});

const slidePayloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("product_tags"),
    tags: z.array(tagSchema).max(5),
  }),
  z.object({
    type: z.literal("promo_card"),
    title: z.string(),
    description: z.string(),
    buttonText: z.string(),
    href: z.string().regex(/^\//),
  }),
]);

export type ValidatedSlide = z.infer<typeof slidePayloadSchema> & {
  id: string;
  imageUrl: string;
};

export async function getActiveSlides() {
  try {
    const slides = await db
      .select()
      .from(heroSlides)
      .where(eq(heroSlides.isActive, true))
      .orderBy(desc(heroSlides.sortOrder));

    const validSlides: ValidatedSlide[] = [];

    for (const slide of slides) {
      // Безопасный парсинг JSONB. Совмещаем type и payload для discriminated union
      const parsed = slidePayloadSchema.safeParse({
        type: slide.type,
        ...((slide.payload as object) || {}),
      });

      if (parsed.success) {
        validSlides.push({
          ...parsed.data,
          id: slide.id,
          // Формируем URL на стороне сервера. Не храним хост в БД!
          imageUrl: `http://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${slide.bucketName}/${slide.fileKey}`,
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
