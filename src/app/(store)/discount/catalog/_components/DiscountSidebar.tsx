"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowDownUp, ChevronDown, X, Menu, Search } from "lucide-react";
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

  const urlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (val: string) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (val.trim()) {
        current.set("q", val.trim());
      } else {
        current.delete("q");
      }
      current.delete("page");
      router.push(`${pathname}?${current.toString()}`, { scroll: false });
    }, 400);
  };

  const handleSort = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value === "newest") current.delete("sort");
    else current.set("sort", value);
    current.delete("page");
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const handleCategory = (categoryId: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (categoryId === "all") current.delete("category");
    else current.set("category", categoryId);
    current.delete("page");
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    setQuery("");
    router.push(pathname, { scroll: false });
  };

  const activeCategory = categories.find((c) => c.id === currentCategory);
  const activeCategoryName = activeCategory?.name;
  const activeCategoryCount = activeCategory?.itemsCount;

  const isFiltered =
    currentCategory !== "all" ||
    currentSort !== "newest" ||
    !!searchParams.get("q");

  return (
    <div
      className={cn(
        "sticky top-20 z-10 flex w-full items-center justify-center",
        "md:top-24",
      )}
    >
      <div
        className={cn(
          "bg-background/80 shadow-nav flex w-full items-center gap-1.5 rounded-xl p-1.5 backdrop-blur-xl backdrop-saturate-150 md:w-fit md:gap-2",
          "md:rounded-[20px]",
        )}
      >
        {/* КНОПКА СОРТИРОВКИ */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "bg-card text-foreground h-12 w-12 shrink-0 gap-0 rounded-lg p-0 text-base font-medium md:w-auto md:gap-2 md:rounded-[16px] md:px-4",
                "duration-300 outline-none hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/20",
              )}
            >
              <ArrowDownUp className="size-4" />
              <span className="hidden md:inline">
                {SORT_OPTIONS.find((o) => o.value === currentSort)?.label}
              </span>
              <ChevronDown
                className={cn(
                  "hidden size-4 opacity-50 transition-transform duration-300 md:block",
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

        {/* СТРОКА ПОИСКА */}
        <div
          className={cn(
            "bg-card flex h-12 flex-1 items-center gap-2 rounded-lg px-3 transition-colors duration-300 md:w-64 md:rounded-[16px]",
            "focus-within:ring-2 focus-within:ring-black/20 hover:bg-gray-200",
          )}
        >
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Поиск..."
            className="placeholder:text-muted-foreground/60 w-full border-none bg-transparent text-base font-medium outline-none placeholder:font-normal"
          />
          {query && (
            <button
              onClick={() => handleSearchChange("")}
              className="text-muted-foreground hover:text-foreground shrink-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              aria-label="Очистить поиск"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* КНОПКА КАТЕГОРИЙ */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "bg-card text-foreground relative h-12 w-12 shrink-0 gap-0 rounded-lg p-0 text-base font-medium md:w-auto md:gap-2 md:rounded-[16px] md:px-4",
                "duration-300 outline-none hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/20",
              )}
            >
              <Menu className="size-4" />
              <div className="hidden items-center gap-1 md:flex">
                <span>{activeCategoryName || "Категории"}</span>
                {currentCategory !== "all" &&
                  activeCategoryCount !== undefined && (
                    <Badge className="bg-brand text-foreground h-5 min-w-5 border-none px-1.5 text-xs font-medium">
                      {activeCategoryCount}
                    </Badge>
                  )}
              </div>
              {/* Бейджик для мобильной версии (абсолютное позиционирование) */}
              {currentCategory !== "all" &&
                activeCategoryCount !== undefined && (
                  <Badge className="bg-brand text-foreground absolute top-2 right-2 flex h-3 min-w-3 items-center justify-center border-none px-1 text-[9px] font-bold md:hidden">
                    {activeCategoryCount}
                  </Badge>
                )}
              <ChevronDown
                className={cn(
                  "hidden size-4 opacity-50 transition-transform duration-300 md:block",
                  "group-data-[state=open]:rotate-180",
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
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

        {/* КНОПКА СБРОСА ФИЛЬТРОВ */}
        {isFiltered && (
          <Button
            onClick={handleReset}
            className={cn(
              "bg-card text-foreground h-12 w-12 shrink-0 rounded-lg p-0 text-base font-medium md:w-auto md:gap-2 md:rounded-[16px] md:px-4",
              "duration-300 outline-none hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/20",
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
