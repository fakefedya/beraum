"use client";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
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
        className={cn(
          "text-foreground rounded-[16px] transition-colors",
          "[&_svg:not([class*='size-'])]:size-6",
          "hover:bg-card duration-300",
          "lg:h-12 lg:w-12 lg:[&_svg]:stroke-[2.5] lg:[&_svg:not([class*='size-'])]:size-4.5",
        )}
        aria-label="Поиск"
      >
        <Search />
      </Button>
    )
  );
};
