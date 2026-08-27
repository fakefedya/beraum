"use server";

import { signIn } from "@/src/lib/auth/auth";
import { LoginSchema } from "@/src/lib/auth/auth.config";
import { db } from "@/src/server/db/client";
import { users, twoFactorTokens } from "@/src/server/db/schema/auth.schema";
import { eq, and } from "drizzle-orm";
import { compare } from "bcrypt-ts";
import { AuthError } from "next-auth";
import { checkRateLimit } from "../utils/rate-limit";
import { generateTwoFactorToken } from "../utils/tokens";
import { sendTwoFactorTokenEmail } from "../services/mail/client";

export type LoginActionState = {
  success: boolean;
  error?: string;
  isTwoFactor?: boolean;
  // 🛡️ Arch: Добавляем payload для проброса стейта между шагами формы
  payload?: Record<string, string>;
};

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

    if (!existingUser || !existingUser.passwordHash) {
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

    const passwordsMatch = await compare(password, existingUser.passwordHash);
    if (!passwordsMatch) {
      return {
        success: false,
        error: "Неверный Email или пароль",
        payload: data,
      };
    }

    if (existingUser.isTwoFactorEnabled) {
      if (!code) {
        const twoFactorToken = await generateTwoFactorToken(existingUser.email);
        await sendTwoFactorTokenEmail(existingUser.email, twoFactorToken.token);

        // 🛡️ Передаем payload обратно на клиент, чтобы сохранить email и password
        return { success: false, isTwoFactor: true, payload: data };
      }

      const [twoFactorToken] = await db
        .select()
        .from(twoFactorTokens)
        .where(
          and(
            eq(twoFactorTokens.email, existingUser.email),
            eq(twoFactorTokens.token, code),
          ),
        );

      if (!twoFactorToken) {
        return {
          success: false,
          error: "Неверный код",
          isTwoFactor: true,
          payload: data,
        };
      }

      if (new Date() > twoFactorToken.expires) {
        return {
          success: false,
          error: "Срок действия кода истек",
          isTwoFactor: true,
          payload: data,
        };
      }
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
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: "Неверные данные для входа",
            payload: data,
            isTwoFactor: prevState.isTwoFactor,
          };
        default:
          return {
            success: false,
            error: "Произошла непредвиденная ошибка",
            payload: data,
            isTwoFactor: prevState.isTwoFactor,
          };
      }
    }
    throw error;
  }
}
