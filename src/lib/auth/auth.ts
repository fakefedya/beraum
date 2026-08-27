import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/src/server/db/client";
import { authConfig, LoginSchema } from "./auth.config";
import { eq, and } from "drizzle-orm";
import { users, twoFactorTokens } from "@/src/server/db/schema/auth.schema";
import { compare } from "bcrypt-ts";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
        code: { type: "text" },
      },
      async authorize(credentials: unknown) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (!validatedFields.success) return null;

        const { email, password, code } = validatedFields.data;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));
        if (!user || !user.passwordHash) return null;
        if (user.isLocked) throw new Error("Аккаунт заблокирован");

        const passwordsMatch = await compare(password, user.passwordHash);
        if (!passwordsMatch) return null;

        if (user.isTwoFactorEnabled) {
          if (!code) throw new Error("2FA_REQUIRED");

          const [twoFactorToken] = await db
            .select()
            .from(twoFactorTokens)
            .where(
              and(
                eq(twoFactorTokens.email, email),
                eq(twoFactorTokens.token, code),
              ),
            );

          if (!twoFactorToken || new Date() > twoFactorToken.expires) {
            throw new Error("INVALID_2FA_CODE");
          }

          await db
            .delete(twoFactorTokens)
            .where(eq(twoFactorTokens.id, twoFactorToken.id));
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isLocked: user.isLocked,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
        };
      },
    }),
  ],
});
