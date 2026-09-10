"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { DASHBOARD_NAV } from "@/src/lib/constants/dashboard";
import type { Role } from "@/src/lib/constants/roles";
import { cn } from "@/src/lib/utils";
import { Icons } from "@/src/components/ui/icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";

interface MobileSidebarProps {
  userRole: Role;
}

export const MobileSidebar = ({ userRole }: MobileSidebarProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const allowedLinks = DASHBOARD_NAV.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-muted text-muted-foreground hover:text-foreground h-9 w-9 px-0 transition-colors lg:hidden"
          aria-label="Открыть мобильное меню"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-r-0 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Навигация панели управления</SheetTitle>
        </SheetHeader>

        <div className="border-border/50 flex h-20 items-center border-b px-6">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 outline-none"
          >
            <Icons.logo className="fill-foreground stroke-current stroke-[0.25] [shape-rendering:crispEdges]" />
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
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors outline-none",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
