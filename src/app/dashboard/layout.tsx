import { auth, signOut } from "@/src/lib/auth/auth";
import { redirect } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Sidebar } from "./_components/Sidebar";
import { Role } from "@/src/lib/constants/dashboard";
import { ThemeToggle } from "./_components/ThemeToggle";
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
    .select({ isLocked: users.isLocked })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!dbUser || dbUser.isLocked) {
    redirect("/auth/login?error=locked");
  }

  const userRole = session.user.role as Role;

  return (
    <div className="text-foreground flex min-h-screen bg-[#FCFCFC] transition-colors duration-300 dark:bg-[#1A1A1A]">
      <Sidebar userRole={userRole} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-border/50 bg-background/50 flex h-16 items-center justify-between border-b px-6 backdrop-blur-md">
          <div className="flex items-center gap-4 lg:hidden">
            <span className="text-lg font-semibold tracking-tight">
              Beraum Admin
            </span>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-medium tracking-wider uppercase">
              {userRole}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <span className="text-muted-foreground border-border/50 hidden border-l pl-4 text-sm font-medium md:block">
              {session.user.email}
            </span>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-destructive/10 hover:text-destructive font-medium transition-colors"
              >
                Выйти
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
