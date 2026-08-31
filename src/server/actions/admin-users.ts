"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { users } from "@/src/server/db/schema";
import { revalidatePath } from "next/cache";
import { hash } from "bcrypt-ts";
import { requireAuthRole } from "../utils/auth-check";

const booleanField = z.preprocess(
  (val) => val === "true" || val === true,
  z.boolean(),
);

const baseUserSchema = {
  name: z.string().min(2).trim(),
  email: z.string().email().trim().toLowerCase(),
  role: z.enum(["superadmin", "manager", "support"]),
  isLocked: booleanField.default(false),
  isTwoFactorEnabled: booleanField.default(true),
};

const createUserSchema = z.object({
  ...baseUserSchema,
  password: z.string().min(8),
});

const updateUserSchema = z.object({
  ...baseUserSchema,
  id: z.string().uuid(),
  password: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().min(8).optional(),
  ),
});

type UpdateUserPayload = {
  name: string;
  role: "superadmin" | "manager" | "support";
  isLocked: boolean;
  isTwoFactorEnabled: boolean;
  passwordHash?: string;
};

export async function createUserAction(formData: FormData) {
  try {
    await requireAuthRole(["superadmin"]);
    const rawData = Object.fromEntries(formData.entries());

    const parsed = createUserSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: "INVALID_DATA" };

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.data.email));

    if (existing) return { success: false, error: "EMAIL_EXISTS" };

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
    return { success: false, error: "DB_ERROR" };
  }
}

export async function updateUserAction(formData: FormData) {
  try {
    const { userId: currentUserId } = await requireAuthRole(["superadmin"]);
    const rawData = Object.fromEntries(formData.entries());

    const parsed = updateUserSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: "INVALID_DATA" };

    const { id, name, role, isLocked, isTwoFactorEnabled, password } =
      parsed.data;

    if (id === currentUserId) {
      if (isLocked) return { success: false, error: "SELF_LOCK_FORBIDDEN" };
      if (role !== "superadmin")
        return { success: false, error: "SELF_DEMOTE_FORBIDDEN" };
    }

    const updateData: UpdateUserPayload = {
      name,
      role,
      isLocked,
      isTwoFactorEnabled,
    };

    if (password !== undefined) {
      updateData.passwordHash = await hash(password, 12);
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "DB_ERROR" };
  }
}

export async function deleteUserAction(id: string) {
  try {
    const { userId: currentUserId } = await requireAuthRole(["superadmin"]);
    if (!z.string().uuid().safeParse(id).success)
      return { success: false, error: "INVALID_ID" };

    if (id === currentUserId)
      return { success: false, error: "SELF_DELETE_FORBIDDEN" };

    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "DB_ERROR" };
  }
}
