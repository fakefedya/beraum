import "server-only";
import crypto from "crypto";
import { db } from "@/src/server/db/client";
import { twoFactorTokens } from "@/src/server/db/schema/auth.schema";
import { eq } from "drizzle-orm";

export async function generateTwoFactorToken(email: string) {
  const token = crypto.randomInt(100000, 1000000).toString();

  // Код живет ровно 5 минут
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

  // Удаляем старые токены этого пользователя
  await db.delete(twoFactorTokens).where(eq(twoFactorTokens.email, email));

  // Записываем новый
  const [twoFactorToken] = await db
    .insert(twoFactorTokens)
    .values({
      email,
      token,
      expires,
    })
    .returning();

  return twoFactorToken;
}
