import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "superadmin" | "manager" | "support";
      isLocked: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    isLocked: boolean;
    isTwoFactorEnabled: boolean;
  }
}
