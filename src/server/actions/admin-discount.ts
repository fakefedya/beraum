"use server";

import { z } from "zod";
import { db } from "@/src/server/db/client";
import { discountItems } from "@/src/server/db/schema/discount.schema";
import { requireAuthRole } from "@/src/server/utils/auth-check";
import { revalidatePath } from "next/cache";

// Строгая схема валидации.
// Скептицизм: мы обязаны ограничить пути медиафайлов, чтобы избежать инъекций чужих S3 URI.
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
  mediaKeys: z
    .array(
      z
        .string()
        .regex(
          /^support-media\/.*\.(jpg|jpeg|png|webp|avif)$/i,
          "Недопустимый путь файла",
        ),
    )
    .max(5, "Максимум 5 фотографий дефекта"),
});

export async function createDiscountItemAction(formData: FormData) {
  try {
    // 1. Проверка авторизации (только для сотрудников)
    await requireAuthRole(["superadmin", "admin", "manager"]);

    // 2. Парсинг FormData
    const rawData = {
      productId: formData.get("productId"),
      uniqueSku: formData.get("uniqueSku"),
      defectDescription: formData.get("defectDescription"),
      discountPrice: formData.get("discountPrice"),
      // FormData передает массивы как отдельные ключи (или JSON строку, зависит от реализации на клиенте)
      // Предполагаем, что фронтенд передаст mediaKeys как массив через append() или JSON
      mediaKeys: JSON.parse((formData.get("mediaKeys") as string) || "[]"),
    };

    // 3. Жесткая валидация
    const parsed = createDiscountItemSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // 4. Запись в БД
    await db.insert(discountItems).values({
      productId: parsed.data.productId,
      uniqueSku: parsed.data.uniqueSku,
      defectDescription: parsed.data.defectDescription,
      discountPrice: parsed.data.discountPrice,
      mediaKeys: parsed.data.mediaKeys,
      status: "available", // По умолчанию доступен
    });

    // Сброс кэша для витрины дисконта
    revalidatePath("/discount");
    revalidatePath("/dashboard/discount-items"); // Роут, который мы создадим в дашборде

    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка createDiscountItemAction:", error);
    // Обработка нарушения уникальности SKU на уровне БД
    if (error instanceof Error && error.message.includes("unique_sku")) {
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
