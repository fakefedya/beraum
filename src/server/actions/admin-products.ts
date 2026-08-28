"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { products, users } from "@/src/server/db/schema";
import { auth } from "@/src/lib/auth/auth";
import { revalidatePath } from "next/cache";

const jsonStringSchema = z
  .string()
  .max(15000, "Слишком большой объем данных")
  .refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return typeof parsed === "object" && parsed !== null;
    } catch {
      return false;
    }
  }, "Ожидается валидный JSON объект");

// 🛡️ SECURITY: Строгий Whitelist для артикулов (защита от Path Traversal и XSS)
const articleRegex = /^[A-Za-z0-9\-_]+$/;

const updateProductSchema = z.object({
  id: z.string().uuid("Некорректный ID"),
  siteArticle: z
    .string()
    .regex(
      articleRegex,
      "Разрешены только латиница, цифры, тире и подчеркивания",
    )
    .min(1, "Модель (site_article) обязательна")
    .trim(),
  itemArticle: z
    .string()
    .regex(
      articleRegex,
      "Разрешены только латиница, цифры, тире и подчеркивания",
    )
    .min(1, "SKU (item_article) обязателен")
    .trim(),
  status: z.enum(["draft", "published", "archived"]),
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
  ozonLink: z.string().url("Невалидный URL Ozon").or(z.literal("")).optional(),
  wbLink: z.string().url("Невалидный URL WB").or(z.literal("")).optional(),
  ymarketLink: z
    .string()
    .url("Невалидный URL Яндекс Маркет")
    .or(z.literal(""))
    .optional(),
  mvideoLink: z
    .string()
    .url("Невалидный URL М.Видео")
    .or(z.literal(""))
    .optional(),
  filters: jsonStringSchema,
  specifications: jsonStringSchema,
});

export async function updateProductAction(formData: FormData) {
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

  const rawData = Object.fromEntries(formData.entries());
  const parsed = updateProductSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  try {
    // 🛡️ SECURITY: Проверяем, не занят ли новый SKU другим товаром (Race Condition protection)
    const [existingSku] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.itemArticle, data.itemArticle));

    if (existingSku && existingSku.id !== data.id) {
      return {
        success: false,
        error: `SKU ${data.itemArticle} уже используется`,
      };
    }

    await db
      .update(products)
      .set({
        siteArticle: data.siteArticle,
        itemArticle: data.itemArticle,
        status: data.status,
        discountPercentage: data.discountPercentage,
        ozonLink: data.ozonLink || null,
        wbLink: data.wbLink || null,
        ymarketLink: data.ymarketLink || null,
        mvideoLink: data.mvideoLink || null,
        filters: JSON.parse(data.filters),
        specifications: JSON.parse(data.specifications),
        updatedAt: new Date(),
      })
      .where(eq(products.id, data.id));

    revalidatePath("/dashboard/products");
    revalidatePath("/", "layout"); // Жесткий сброс кэша всей витрины, так как URL мог измениться

    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка обновления товара:", error);
    return { success: false, error: "Системная ошибка БД" };
  }
}

const createProductSchema = z.object({
  categoryId: z.string().uuid("Выберите категорию"),
  siteArticle: z
    .string()
    .regex(
      articleRegex,
      "Разрешены только латиница, цифры, тире и подчеркивания",
    )
    .min(1, "Модель (site_article) обязательна")
    .trim(),
  itemArticle: z
    .string()
    .regex(
      articleRegex,
      "Разрешены только латиница, цифры, тире и подчеркивания",
    )
    .min(1, "SKU (item_article) обязателен")
    .trim(),
  colorName: z.string().optional(),
});

export async function createProductAction(formData: FormData) {
  const session = await auth();
  if (
    !session?.user ||
    !["superadmin", "manager"].includes(session.user.role)
  ) {
    return { success: false, error: "Недостаточно прав" };
  }

  const rawData = Object.fromEntries(formData.entries());
  const parsed = createProductSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  try {
    // 🛡️ Защита от дублей при создании
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.itemArticle, data.itemArticle));

    if (existing) {
      return {
        success: false,
        error: `Артикул ${data.itemArticle} уже существует`,
      };
    }

    await db.insert(products).values({
      categoryId: data.categoryId,
      siteArticle: data.siteArticle,
      itemArticle: data.itemArticle,
      colorName: data.colorName || null,
      status: "draft", // Строго черновик по умолчанию
      filters: {},
      specifications: {},
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка создания товара:", error);
    return { success: false, error: "Системная ошибка БД" };
  }
}
