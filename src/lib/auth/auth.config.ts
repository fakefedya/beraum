import type { NextAuthConfig } from "next-auth";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Некорректный email" }),
  password: z.string().min(8, { message: "Минимум 8 символов" }),
  code: z.string().optional(),
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
    maxAge: 60 * 60 * 12,
  },
} satisfies NextAuthConfig;
