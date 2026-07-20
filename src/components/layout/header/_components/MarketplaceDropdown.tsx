"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { MARKETPLACE_LINKS } from "@/src/lib/constants";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

export const MarketplaceDropdown = () => {
  const pathname = usePathname();
  const isDiscount = pathname.startsWith("/discount");

  const links = isDiscount
    ? MARKETPLACE_LINKS.discount
    : MARKETPLACE_LINKS.store;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"gradient"}
          className={cn(
            "hidden h-12 items-center gap-4 rounded-[16px] text-[15px] font-semibold lg:flex",

            "[&[data-state=open]>svg]:rotate-180",
          )}
        >
          Где купить
          <ChevronDown className="transition-transform duration-300" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="shadow-card rounded-xl border-none p-2"
      >
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <DropdownMenuItem
              key={link.label}
              asChild
              className="group hover:bg-hover-background/80 focus:hover-background/80 cursor-pointer rounded-lg p-4 transition-colors"
            >
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 outline-none"
              >
                <div className="flex shrink-0 items-center justify-center">
                  <Icon className="size-12" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-base leading-none font-medium">
                    {link.label}
                  </span>
                  <span className="text-muted-foreground text-sm font-normal">
                    {link.description}
                  </span>
                </div>
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
