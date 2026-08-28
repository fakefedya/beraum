"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { users } from "@/src/server/db/schema";
import { auth } from "@/src/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { hash } from "bcrypt-ts";

// Защита от FormData: checkbox отправляет строку "true" или "false"
const booleanField = z.preprocess(
  (val) => val === "true" || val === true,
  z.boolean(),
);

const baseUserSchema = {
  name: z.string().min(2, "Минимум 2 символа").trim(),
  email: z.string().email("Неверный формат email").trim().toLowerCase(),
  role: z.enum(["superadmin", "manager", "support"]),
  isLocked: booleanField.default(false),
  isTwoFactorEnabled: booleanField.default(true),
};

const createUserSchema = z.object({
  ...baseUserSchema,
  // Пароль строго обязателен при создании
  password: z.string().min(8, "Минимум 8 символов"),
});

const updateUserSchema = z.object({
  ...baseUserSchema,
  id: z.string().uuid("ID обязателен"),
  // Пустая строка пройдет (пароль не меняется), но если есть ввод — минимум 8 символов
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Минимум 8 символов",
    }),
});

async function requireSuperadmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Не авторизован");

  const [dbUser] = await db
    .select({ role: users.role, isLocked: users.isLocked })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!dbUser || dbUser.isLocked || dbUser.role !== "superadmin") {
    throw new Error("Доступ запрещен. Требуются права Superadmin.");
  }
  return session.user.id;
}

export async function createUserAction(formData: FormData) {
  await requireSuperadmin();
  const rawData = Object.fromEntries(formData.entries());

  const parsed = createUserSchema.safeParse(rawData);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.data.email));

    if (existing) return { success: false, error: "Email уже используется" };

    const passwordHash = await hash(parsed.data.password, 12);

    await db.insert(users).values({
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash,
      isTwoFactorEnabled: parsed.data.isTwoFactorEnabled,
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Ошибка базы данных" };
  }
}

type UpdateUserPayload = {
  name: string;
  role: "superadmin" | "manager" | "support";
  isLocked: boolean;
  isTwoFactorEnabled: boolean;
  passwordHash?: string;
};

export async function updateUserAction(formData: FormData) {
  const currentUserId = await requireSuperadmin();
  const rawData = Object.fromEntries(formData.entries());

  const parsed = updateUserSchema.safeParse(rawData);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const { id, name, role, isLocked, isTwoFactorEnabled, password } =
    parsed.data;

  // Защита от блокировки самого себя
  if (id === currentUserId) {
    if (isLocked)
      return { success: false, error: "Нельзя заблокировать самого себя" };
    if (role !== "superadmin")
      return { success: false, error: "Нельзя понизить свою роль" };
  }

  try {
    const updateData: UpdateUserPayload = {
      name,
      role,
      isLocked,
      isTwoFactorEnabled,
    };

    // Хэшируем только если пароль реально передан и валиден
    if (password) {
      updateData.passwordHash = await hash(password, 12);
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Ошибка обновления пользователя" };
  }
}

export async function deleteUserAction(id: string) {
  const currentUserId = await requireSuperadmin();
  if (!z.string().uuid().safeParse(id).success)
    return { success: false, error: "Невалидный ID" };

  if (id === currentUserId)
    return { success: false, error: "Нельзя удалить свою учетную запись" };

  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Ошибка при удалении" };
  }
}
