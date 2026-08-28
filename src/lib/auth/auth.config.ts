import type { NextAuthConfig } from "next-auth";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .email({ message: "Некорректный email" })
    .trim()
    .toLowerCase(),
  password: z.string().min(8, { message: "Минимум 8 символов" }),

  code: z.preprocess(
    (val) => (val === "" || val === "undefined" ? undefined : val),
    z
      .string()
      .regex(/^\d{6}$/, { message: "Код должен состоять из 6 цифр" })
      .optional(),
  ),
});

export const authConfig = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  providers: [],
  callbacks: {
    async signIn({ user }) {
      if (user?.isLocked) return false;
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "superadmin" | "manager" | "support";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60,
  },
} satisfies NextAuthConfig;
