// src/server/actions/auth.ts
"use server";

import { signIn } from "@/src/lib/auth/auth";
import { LoginSchema } from "@/src/lib/auth/auth.config";
import { db } from "@/src/server/db/client";
import { users, twoFactorTokens } from "@/src/server/db/schema/auth.schema";
import { eq } from "drizzle-orm"; // Убрали and, он тут больше не нужен
import { compare } from "bcrypt-ts";
import { AuthError } from "next-auth";
import { checkRateLimit } from "../utils/rate-limit";
import { generateTwoFactorToken } from "../utils/tokens";
import { sendTwoFactorTokenEmail } from "../services/mail/client";

export type LoginActionState = {
  success: boolean;
  error?: string;
  isTwoFactor?: boolean;
  payload?: Record<string, string>;
};

// Статичный bcrypt-хэш для защиты от тайминг-атак (чтобы время проверки не выдавало наличие юзера)
const DUMMY_HASH =
  "$2b$10$EpRnTzVlqHIJvw2p0YQf2.gH9Q9k2rNq1G8zGv1l2v1l2v1l2v1l2";

export async function loginAction(
  prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const data = Object.fromEntries(formData.entries()) as Record<string, string>;

  try {
    const rateLimit = await checkRateLimit("login_attempt", 5, 60000);
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Слишком много попыток. Подождите минуту.",
        payload: data,
        isTwoFactor: prevState.isTwoFactor,
      };
    }

    const parsed = LoginSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: "Некорректно заполнены поля",
        payload: data,
        isTwoFactor: prevState.isTwoFactor,
      };
    }

    const { email, password, code } = parsed.data;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    // 🛡️ Security: Выполняем compare в ЛЮБОМ СЛУЧАЕ, чтобы защититься от User Enumeration
    const hashToCompare = existingUser?.passwordHash || DUMMY_HASH;
    const passwordsMatch = await compare(password, hashToCompare);

    if (!existingUser || !passwordsMatch) {
      return {
        success: false,
        error: "Неверный Email или пароль",
        payload: data,
      };
    }

    if (existingUser.isLocked) {
      return {
        success: false,
        error: "Аккаунт заблокирован. Обратитесь к администратору.",
        payload: data,
      };
    }

    // 🛡️ Security: Жесткий контроль 2FA с лимитом попыток
    if (existingUser.isTwoFactorEnabled) {
      if (!code) {
        const twoFactorToken = await generateTwoFactorToken(existingUser.email);
        await sendTwoFactorTokenEmail(existingUser.email, twoFactorToken.token);
        return { success: false, isTwoFactor: true, payload: data };
      }

      // Ищем токен ТОЛЬКО по email, чтобы проверить количество попыток
      const [twoFactorToken] = await db
        .select()
        .from(twoFactorTokens)
        .where(eq(twoFactorTokens.email, existingUser.email));

      if (!twoFactorToken) {
        return {
          success: false,
          error: "Код не запрошен или аннулирован",
          isTwoFactor: true,
          payload: data,
        };
      }

      if (new Date() > twoFactorToken.expires) {
        await db
          .delete(twoFactorTokens)
          .where(eq(twoFactorTokens.id, twoFactorToken.id));
        return {
          success: false,
          error: "Срок действия кода истек",
          isTwoFactor: true,
          payload: data,
        };
      }

      // Проверка на Brute-force
      if (twoFactorToken.token !== code) {
        const newAttempts = twoFactorToken.attempts + 1;

        if (newAttempts >= 3) {
          await db
            .delete(twoFactorTokens)
            .where(eq(twoFactorTokens.id, twoFactorToken.id));
          return {
            success: false,
            error: "Превышен лимит попыток. Запросите код заново.",
            isTwoFactor: false, // Возвращаем на шаг ввода пароля
            payload: { email, password },
          };
        } else {
          await db
            .update(twoFactorTokens)
            .set({ attempts: newAttempts })
            .where(eq(twoFactorTokens.id, twoFactorToken.id));

          return {
            success: false,
            error: `Неверный код. Осталось попыток: ${3 - newAttempts}`,
            isTwoFactor: true,
            payload: data,
          };
        }
      }

      // Если код верный, пропускаем дальше.
      // NextAuth (в auth.ts) проведет финальную сверку и удалит запись.
    }

    await signIn("credentials", {
      email,
      password,
      code,
      redirectTo: "/dashboard",
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Неверные данные для входа",
        payload: data,
        isTwoFactor: prevState.isTwoFactor,
      };
    }
    // Пробрасываем ошибку SMTP на клиент без стектрейса
    if (
      error instanceof Error &&
      error.message === "Не удалось отправить код на почту"
    ) {
      return {
        success: false,
        error: error.message,
        payload: data,
        isTwoFactor: prevState.isTwoFactor,
      };
    }
    throw error;
  }
}
