"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { NAV_LINKS } from "@/src/lib/constants";
import { NavDesktop } from "./NavDesktop";

export const NavPill = () => {
  const pathname = usePathname();
  const isDiscount = pathname.startsWith("/discount");
  const links = isDiscount ? NAV_LINKS.discount : NAV_LINKS.store;

  return (
    <div
      className={cn(
        "h-full items-center justify-between rounded-full py-1 pr-1 pl-8 transition-all duration-300 lg:flex lg:w-full",
        isDiscount ? "bg-brand" : "bg-glass",
      )}
    >
      <NavDesktop links={links} />

      <div className="flex h-full items-center gap-8">
        {isDiscount ? (
          ""
        ) : (
          <Button
            variant="transparent"
            size="icon-xs"
            className="text-black-muted [&_svg:size-6] transition-colors duration-300 hover:text-black"
            aria-label="Поиск"
          >
            <Search />
          </Button>
        )}

        <Button
          variant={isDiscount ? "white" : "brand"}
          className="h-full"
          asChild
        >
          <Link href="/stores">Где купить</Link>
        </Button>
      </div>
    </div>
  );
};
