"use client";

import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { FOOTER_LINKS } from "@/src/lib/constants";
import { usePathname } from "next/navigation";

export const Footer = () => {
  const pathname = usePathname();

  return (
    <footer
      className={cn(
        "absolute bottom-2 left-0 z-10 hidden w-full px-4",
        "lg:bottom-4 lg:block",
      )}
    >
      <div className={cn("flex w-full max-w-full justify-center")}>
        <div className="flex w-fit items-center justify-center gap-4">
          <div
            className={cn(
              "text-xs font-medium tracking-wider",
              pathname === "/" ? "text-background/50" : "text-muted-foreground",
            )}
          >
            © {new Date().getFullYear()} BERAUM
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center gap-1 rounded-sm text-xs font-medium tracking-wider outline-none",
                "transition-colors duration-300",
                "focus-visible:ring-2 focus-visible:ring-black",
                "[&[data-state=open]>svg]:rotate-180",
                pathname === "/"
                  ? "hover:text-background text-background/50 data-[state=open]:text-background"
                  : "hover:text-foreground text-muted-foreground data-[state=open]:text-foreground",
              )}
            >
              T&C
              <ChevronUp className="size-3 transition-transform duration-300" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="top"
              align="end"
              sideOffset={16}
              className="shadow-card bg-background min-w-60 rounded-[16px] border-none p-1.5"
            >
              {FOOTER_LINKS.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  asChild
                  className="hover:bg-hover-background/80 focus:hover-background/80 cursor-pointer rounded-xl p-3 transition-colors"
                >
                  <Link
                    href={link.href}
                    prefetch={false} // 🛡 Защита от спама префетчами
                    className="w-full text-sm font-medium tracking-tight"
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </footer>
  );
};
