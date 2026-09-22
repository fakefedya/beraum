"use server";

import "server-only";
import { signIn } from "@/src/lib/auth/auth";
import { LoginSchema } from "@/src/lib/auth/auth.config";
import { db } from "@/src/server/db/client";
import { users, twoFactorTokens } from "@/src/server/db/schema/auth.schema";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt-ts";
import { AuthError } from "next-auth";
import { checkRateLimit } from "../utils/rate-limit";
import { generateTwoFactorToken } from "../utils/tokens";
import { sendTwoFactorTokenEmail } from "../services/mail/client";
import { getClientIp } from "../utils/ip";
import { after } from "next/server";

export type LoginActionState = {
  success: boolean;
  error?: string;
  isTwoFactor?: boolean;
  payload?: Record<string, string>;
};

const DUMMY_HASH =
  "$2b$10$EpRnTzVlqHIJvw2p0YQf2.gH9Q9k2rNq1G8zGv1l2v1l2v1l2v1l2";

export async function loginAction(
  prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const data = Object.fromEntries(formData.entries()) as Record<string, string>;
  const rawEmail = data.email || "";

  try {
    const parsed = LoginSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: "Некорректно заполнены поля",
        payload: { email: rawEmail },
        isTwoFactor: prevState.isTwoFactor,
      };
    }

    const { email, password, code } = parsed.data;

    // Валидация Rate Limit
    const ipLimit = await checkRateLimit("login_ip", 15, 60000);
    const emailLimit = await checkRateLimit(
      "login_email",
      5,
      60000,
      email,
      true,
    );

    if (!ipLimit.success || !emailLimit.success) {
      return {
        success: false,
        error: "Обнаружена подозрительная активность. Попробуйте позже.",
        payload: { email },
        isTwoFactor: prevState.isTwoFactor,
      };
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser?.isLocked) {
      return {
        success: false,
        error: "Аккаунт заблокирован. Обратитесь к администратору.",
        payload: { email },
      };
    }

    // ШАГ 1: Валидация пароля (OTP-кода еще нет)
    if (!code) {
      const hashToCompare = existingUser?.passwordHash || DUMMY_HASH;
      const passwordsMatch = await compare(password || "", hashToCompare);

      if (!existingUser || !passwordsMatch) {
        return {
          success: false,
          error: "Неверный Email или пароль",
          payload: { email },
        };
      }

      if (existingUser.isTwoFactorEnabled) {
        const [existingToken] = await db
          .select()
          .from(twoFactorTokens)
          .where(eq(twoFactorTokens.email, existingUser.email));

        if (existingToken && new Date() < existingToken.expires) {
          return {
            success: false,
            isTwoFactor: true,
            payload: { email },
          };
        }

        const twoFactorToken = await generateTwoFactorToken(existingUser.email);

        after(async () => {
          try {
            await sendTwoFactorTokenEmail(
              existingUser.email,
              twoFactorToken.token,
            );
          } catch (err) {
            console.error("❌ Фоновая отправка 2FA не удалась:", err);
          }
        });

        return { success: false, isTwoFactor: true, payload: { email } };
      }
    } else {
      // ШАГ 2: Валидация OTP-кода (пароль больше не проверяется здесь)
      if (!existingUser) {
        return {
          success: false,
          error: "Пользователь не найден",
          payload: { email },
        };
      }

      if (existingUser.isTwoFactorEnabled) {
        const [twoFactorToken] = await db
          .select()
          .from(twoFactorTokens)
          .where(eq(twoFactorTokens.email, existingUser.email));

        if (!twoFactorToken) {
          return {
            success: false,
            error: "Код не запрошен или аннулирован",
            isTwoFactor: true,
            payload: { email },
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
            payload: { email },
          };
        }

        if (twoFactorToken.token !== code) {
          const newAttempts = twoFactorToken.attempts + 1;

          if (newAttempts >= 3) {
            await db
              .delete(twoFactorTokens)
              .where(eq(twoFactorTokens.id, twoFactorToken.id));
            return {
              success: false,
              error: "Превышен лимит попыток. Запросите код заново.",
              isTwoFactor: false, // Сбрасываем процесс, заставляем ввести пароль
              payload: { email },
            };
          } else {
            await db
              .update(twoFactorTokens)
              .set({ attempts: newAttempts })
              .where(eq(twoFactorTokens.id, twoFactorToken.id));

            return {
              success: false,
              error: "Неверный код",
              isTwoFactor: true,
              payload: { email },
            };
          }
        }
      }
    }

    // Аутентификация успешна, обновляем данные в БД
    const ip = await getClientIp();
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      })
      .where(eq(users.id, existingUser.id));

    // Инициируем сессию Auth.js
    const authPayload: Record<string, string> = {
      email,
      redirectTo: "/dashboard",
    };
    if (password) authPayload.password = password;
    if (code) authPayload.code = code;

    await signIn("credentials", authPayload);

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Неверные данные для входа",
        payload: { email: rawEmail },
        isTwoFactor: prevState.isTwoFactor,
      };
    }
    if (
      error instanceof Error &&
      error.message === "Не удалось отправить код на почту"
    ) {
      return {
        success: false,
        error: error.message,
        payload: { email: rawEmail },
        isTwoFactor: prevState.isTwoFactor,
      };
    }
    throw error;
  }
}
