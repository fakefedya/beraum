"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { NAV_LINKS } from "@/src/lib/constants";
import { NavDesktop } from "./NavDesktop";
import { MarketplaceDropdown } from "./MarketplaceDropdown";
import { NavMobile } from "./NavMobile";

export const NavPill = () => {
  const pathname = usePathname();
  const isDiscount = pathname.startsWith("/discount");
  const links = isDiscount ? NAV_LINKS.discount : NAV_LINKS.store;

  return (
    <div
      className={cn(
        "flex h-full items-center justify-between rounded-full py-1 pr-4 pl-4 backdrop-blur-2xl transition-all duration-300 xl:w-full xl:pr-1 xl:pl-8",
        isDiscount ? "bg-brand" : "bg-frosted-glass/40",
      )}
    >
      <NavDesktop links={links} />
      <div className="flex h-full items-center gap-4 xl:gap-8">
        {!isDiscount && (
          <Button
            variant="transparent"
            size="icon-xs"
            className="[&_svg:size-6] text-muted-foreground hover:text-foreground transition-colors duration-300"
            aria-label="Поиск"
          >
            <Search />
          </Button>
        )}

        <NavMobile links={links} />

        <div className="hidden h-full xl:block">
          <MarketplaceDropdown />
        </div>
      </div>
    </div>
  );
};
