import { signOut } from "@/src/lib/auth/auth";
import { Button } from "@/src/components/ui/button";
import { MobileSidebar } from "./MobileSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { LogOut, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { type Role } from "@/src/lib/constants/dashboard";

const PAYLOAD_ROLES: Record<Role, string> = {
  superadmin: "Администратор",
  support: "Поддержка",
  manager: "Менеджер",
};

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  userRole: Role;
}

export const DashboardHeader = ({ user, userRole }: DashboardHeaderProps) => {
  return (
    <header className="border-border/50 bg-background/50 flex h-16 items-center justify-between border-b px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3 md:gap-4">
        <MobileSidebar userRole={userRole} />

        <div className="flex items-center">
          <span className="border-border/50 text-sm md:mr-4 md:border-r md:pr-4">
            {user.name}
          </span>
          <span className="bg-brand hidden rounded-sm px-1 text-sm text-black/80 md:block">
            {PAYLOAD_ROLES[userRole]}
          </span>
          <span className="text-muted-foreground border-border/50 ml-4 hidden border-l pl-4 text-sm md:block">
            {user.email}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href={"/"}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-muted text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center gap-2 rounded-md px-0 text-sm font-medium transition-colors duration-300 md:w-fit md:px-4"
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
            className="bg-muted text-muted-foreground hover:text-foreground h-9 w-9 px-0 transition-colors md:w-fit md:px-4"
            title="Выйти"
          >
            <LogOut className="h-5 w-5 md:mr-2" />
            <span className="hidden md:block">Выйти</span>
          </Button>
        </form>
      </div>
    </header>
  );
};
