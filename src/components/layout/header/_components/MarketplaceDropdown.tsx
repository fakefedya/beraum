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
          variant={isDiscount ? "white" : "brand"}
          className="h-full cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-black/20"
        >
          Где купить
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
              className="group cursor-pointer rounded-lg p-4 transition-colors hover:bg-gray-50 focus:bg-gray-50"
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
                  <span className="text-base leading-none font-medium text-black">
                    {link.label}
                  </span>
                  <span className="text-black-muted text-sm font-normal">
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
