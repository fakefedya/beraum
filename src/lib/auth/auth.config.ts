import type { NextAuthConfig } from "next-auth";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8),
  code: z.preprocess(
    (val) =>
      val === "" || val === "undefined" || val === null ? undefined : val,
    z
      .string()
      .regex(/^\d{6}$/)
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
        token.isLocked = user.isLocked;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "superadmin" | "manager" | "support";
        session.user.isLocked = token.isLocked as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60,
  },
} satisfies NextAuthConfig;
