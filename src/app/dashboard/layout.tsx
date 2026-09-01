import { auth, signOut } from "@/src/lib/auth/auth";
import { redirect } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Sidebar } from "./_components/Sidebar";
import { Role } from "@/src/lib/constants/dashboard";
import { ThemeToggle } from "./_components/ThemeToggle";
import { db } from "@/src/server/db/client";
import { users } from "@/src/server/db/schema";
import { eq } from "drizzle-orm";
import { LogOut, ShoppingCart } from "lucide-react";
import Link from "next/link";

const PAYLOAD_ROLES: Record<Role, string> = {
  superadmin: "Администратор",
  support: "Поддержка",
  manager: "Менеджер",
};

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
        <header className="border-border/50 bg-background/50 flex h-16 items-center justify-between border-b px-6 backdrop-blur-md">
          <div className="flex items-center">
            <span className="border-border/50 text-sm md:mr-4 md:border-r md:pr-4">
              {session.user.name}
            </span>
            <span className="bg-brand hidden rounded-sm px-1 text-sm text-black/80 md:block">
              {PAYLOAD_ROLES[userRole]}
            </span>
            <span className="text-muted-foreground border-border/50 ml-4 hidden border-l pl-4 text-sm md:block">
              {session.user.email}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={"/"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-muted text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-300 md:w-fit md:px-4"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden md:block">Перейти на сайт</span>
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="bg-muted text-muted-foreground hover:text-foreground h-9 w-fit px-4 transition-colors"
                title="Выйти"
              >
                <LogOut className="h-5 w-5" />
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
