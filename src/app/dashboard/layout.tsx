import { auth } from "@/src/lib/auth/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./_components/Sidebar";
import { DashboardHeader } from "./_components/DashboardHeader";
import type { Role } from "@/src/lib/constants/roles";
import { db } from "@/src/server/db/client";
import { users } from "@/src/server/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const [dbUser] = await db
    .select({ isLocked: users.isLocked, role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!dbUser || dbUser.isLocked) {
    redirect("/auth/login?error=locked");
  }

  const userRole = dbUser.role as Role;

  return (
    <div className="text-foreground flex min-h-screen bg-[#FCFCFC] transition-colors duration-300 dark:bg-[#1A1A1A]">
      <Sidebar userRole={userRole} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={session.user} userRole={userRole} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
