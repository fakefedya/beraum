"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowDownUp, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "По умолчанию" },
  { value: "price_asc", label: "Сначала дешевле" },
  { value: "price_desc", label: "Сначала дороже" },
];

interface CategoryCount {
  id: string;
  name: string;
  slug: string;
  itemsCount: number;
}

interface DiscountSidebarProps {
  categories: CategoryCount[];
  currentCategory: string;
  currentSort: string;
}

export const DiscountSidebar = ({
  categories,
  currentCategory,
  currentSort,
}: DiscountSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSort = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value === "newest") {
      current.delete("sort");
    } else {
      current.set("sort", value);
    }
    current.delete("page");
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const handleCategory = (categoryId: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (categoryId === "all") {
      current.delete("category");
    } else {
      current.set("category", categoryId);
    }
    current.delete("page");
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    router.push(pathname, { scroll: false });
  };

  const activeCategoryName = categories.find(
    (c) => c.id === currentCategory,
  )?.name;
  const isFiltered = currentCategory !== "all" || currentSort !== "newest";

  return (
    <div
      className={cn(
        "item-center sticky top-20 z-10 flex w-full justify-center",
        "md:top-24",
      )}
    >
      <div
        className={cn(
          "bg-background/80 shadow-nav flex w-fit flex-wrap gap-2 rounded-xl p-1 backdrop-blur-xl backdrop-saturate-150",
          "md:rounded-[20px] md:p-1.5",
        )}
      >
        {/* Сортировка */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "bg-card text-foreground h-12 gap-2 rounded-lg px-3 text-base font-medium",
                "duration-300 outline-none hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/20",
                "md:gap-4 md:rounded-[16px]",
              )}
            >
              <ArrowDownUp className="size-4" />
              <span className="hidden md:inline">
                {SORT_OPTIONS.find((o) => o.value === currentSort)?.label}
              </span>
              <span className={cn("inline", "md:hidden")}>Сортировка</span>
              <ChevronDown
                className={cn(
                  "size-4 opacity-50 transition-transform duration-300",
                  "group-data-[state=open]:rotate-180",
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className={cn(
              "shadow-card w-56 rounded-lg border-none p-1.5",
              "md:rounded-[16px]",
            )}
          >
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSort(option.value)}
                className={cn(
                  "cursor-pointer rounded-xl p-3 text-base transition-colors outline-none",
                  "hover:bg-hover-background/80 focus:bg-hover-background/80",
                  currentSort === option.value && "bg-accent font-medium",
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Категории */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "bg-card text-foreground h-12 gap-2 rounded-lg px-3 text-base font-medium",
                "duration-300 outline-none hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/20",
                "md:gap-4 md:rounded-[16px]",
              )}
            >
              <SlidersHorizontal className="size-4" />
              <div className="flex items-center gap-1">
                {activeCategoryName || "Категории"}
                {currentCategory !== "all" && (
                  <Badge className="bg-brand text-foreground ml-1 h-5 min-w-5 border-none px-1.5 text-xs font-medium">
                    1
                  </Badge>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className={cn(
              "shadow-card w-64 rounded-lg border-none p-1.5",
              "md:rounded-[16px]",
            )}
          >
            <DropdownMenuItem
              onClick={() => handleCategory("all")}
              className={cn(
                "flex cursor-pointer justify-between rounded-xl p-3 text-base transition-colors outline-none",
                "hover:bg-hover-background/80 focus:bg-hover-background/80",
                currentCategory === "all" && "bg-accent font-medium",
              )}
            >
              <span>Все товары</span>
            </DropdownMenuItem>

            {categories.map((cat) => (
              <DropdownMenuItem
                key={cat.id}
                onClick={() => handleCategory(cat.id)}
                className={cn(
                  "flex cursor-pointer justify-between rounded-xl p-3 text-base transition-colors outline-none",
                  "hover:bg-hover-background/80 focus:bg-hover-background/80",
                  currentCategory === cat.id && "bg-accent font-medium",
                )}
              >
                <span className="truncate pr-2">{cat.name}</span>
                <span className="text-muted-foreground text-sm opacity-60">
                  {cat.itemsCount}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Кнопка сброса */}
        {isFiltered && (
          <Button
            onClick={handleReset}
            className={cn(
              "bg-card text-foreground h-12 gap-2 rounded-lg px-3 text-base font-medium",
              "duration-300 outline-none hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/20",
              "md:gap-3 md:rounded-[16px] md:px-4",
            )}
            aria-label="Сбросить фильтры"
          >
            <X className="size-4" />
            <span className="hidden md:inline">Сбросить</span>
          </Button>
        )}
      </div>
    </div>
  );
};
