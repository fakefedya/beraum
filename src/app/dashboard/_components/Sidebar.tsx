"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV, Role } from "@/src/lib/constants/dashboard";
import { cn } from "@/src/lib/utils";
import { Icons } from "@/src/components/ui/icons";

interface SidebarProps {
  userRole: Role;
}

export const Sidebar = ({ userRole }: SidebarProps) => {
  const pathname = usePathname();

  const allowedLinks = DASHBOARD_NAV.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <aside className="border-border/50 hidden w-64 flex-col border-r lg:flex">
      <div className="flex h-16 items-center px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 outline-none"
        >
          <Icons.logo className="text-foreground h-5 w-auto" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {allowedLinks.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
