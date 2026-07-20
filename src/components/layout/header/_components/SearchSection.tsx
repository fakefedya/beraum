"use client";

import { Button } from "@/src/components/ui/button";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

export const SearchSection = () => {
  const pathname = usePathname();
  const isDiscount = pathname.startsWith("/discount");
  if (isDiscount) return null;

  return (
    !isDiscount && (
      <Button
        variant="transparent"
        size="icon-xs"
        className="text-muted-foreground hover:text-foreground hover:bg-card h-12 w-12 rounded-[16px] transition-colors duration-300 [&_svg]:stroke-[2.5] [&_svg:not([class*='size-'])]:size-4.5"
        aria-label="Поиск"
      >
        <Search />
      </Button>
    )
  );
};
