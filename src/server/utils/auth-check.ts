import "server-only";
import { auth } from "@/src/lib/auth/auth";
import { db } from "@/src/server/db/client";
import { users } from "@/src/server/db/schema/auth.schema";
import { eq } from "drizzle-orm";
import type { Role } from "@/src/lib/constants/dashboard";

export async function requireAuthRole(allowedRoles: Role[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const [dbUser] = await db
    .select({ role: users.role, isLocked: users.isLocked })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!dbUser || dbUser.isLocked) throw new Error("FORBIDDEN_LOCKED");

  const userRole = dbUser.role as Role;
  if (!allowedRoles.includes(userRole)) {
    throw new Error("FORBIDDEN_ROLE");
  }

  return { userId: session.user.id, role: userRole };
}
