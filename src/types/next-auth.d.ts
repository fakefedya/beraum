import NextAuth, { type DefaultSession } from "next-auth";
import type { Role } from "@/src/lib/constants/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      isLocked: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    isLocked: boolean;
    isTwoFactorEnabled: boolean;
  }
}
