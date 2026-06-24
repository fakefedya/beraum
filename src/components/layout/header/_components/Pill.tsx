"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { NAV_LINKS } from "@/src/lib/constants";
import { DesktopNav } from "./DesktopNav";

export const Pill = () => {
  const pathname = usePathname();
  const isDiscount = pathname.startsWith("/discount");
  const links = isDiscount ? NAV_LINKS.discount : NAV_LINKS.store;

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-between rounded-full py-1 pr-1 pl-5 transition-all duration-500",
        isDiscount ? "bg-brand" : "bg-frost-glass",
      )}
    >
      <DesktopNav links={links} />

      <div className="flex h-full items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Поиск"
        >
          <Search className="h-5 w-5" />
        </Button>

        <Button
          variant={isDiscount ? "default" : "brand"}
          className="h-full rounded-full px-6"
          asChild
        >
          <Link href="/stores">Где купить</Link>
        </Button>
      </div>
    </div>
  );
};
