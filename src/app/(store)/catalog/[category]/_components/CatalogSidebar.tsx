"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CATEGORY_FILTERS } from "@/src/lib/constants";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import { SlidersHorizontal, ArrowDownUp, ChevronDown, X } from "lucide-react";

interface CatalogSidebarProps {
  categorySlug: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "По умолчанию" },
  { value: "price_asc", label: "Сначала дешевле" },
  { value: "price_desc", label: "Сначала дороже" },
];

export const CatalogSidebar = ({ categorySlug }: CatalogSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const filters = CATEGORY_FILTERS[categorySlug];
  const currentSort = searchParams.get("sort") || "newest";

  if (!filters || filters.length === 0) return null;

  const activeFiltersCount = filters.reduce((acc, filter) => {
    return acc + searchParams.getAll(filter.key).length;
  }, 0);

  const handleSort = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value === "newest") {
      current.delete("sort");
    } else {
      current.set("sort", value);
    }
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const handleCheck = (key: string, value: string, checked: boolean) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    const existingValues = current.getAll(key);
    current.delete(key);

    if (checked) {
      existingValues.forEach((v) => current.append(key, v));
      current.append(key, value);
    } else {
      existingValues
        .filter((v) => v !== value)
        .forEach((v) => current.append(key, v));
    }

    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    const current = new URLSearchParams();
    if (currentSort !== "newest") {
      current.set("sort", currentSort);
    }
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
    setIsFiltersOpen(false);
  };

  return (
    <div className="item-center sticky top-20 z-10 flex w-full justify-center p-2 pr-2 pl-4">
      <div className="bg-background shadow-nav flex w-fit flex-wrap gap-2 rounded-[20px] p-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "bg-card text-foreground h-12 gap-4 rounded-[16px] px-4 text-base font-medium",
                "duration-300 hover:bg-gray-200",
              )}
            >
              <ArrowDownUp className="size-4" />
              <span className="hidden md:inline">
                {SORT_OPTIONS.find((o) => o.value === currentSort)?.label}
              </span>
              <span className="md:hidden">Сортировка</span>
              <ChevronDown
                className={cn(
                  "size-4 opacity-50",
                  "transition-transform duration-300",
                  "group-data-[state=open]:rotate-180",
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="shadow-card w-48 rounded-[16px] border-none p-1.5"
          >
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSort(option.value)}
                className={cn(
                  "cursor-pointer rounded-xl p-3 text-base",
                  "hover:bg-hover-background/80 transition-colors",
                  "focus:hover-background/80",
                  currentSort === option.value && "bg-accent font-medium",
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              className={cn(
                "bg-card text-foreground h-12 gap-4 rounded-[16px] px-4 text-base font-medium",
                "duration-300 hover:bg-gray-200",
              )}
            >
              <SlidersHorizontal className="size-4" />
              <div className="flex items-center gap-1">
                Фильтры
                {activeFiltersCount > 0 && (
                  <Badge className="bg-brand text-foreground ml-1 h-5 min-w-5 px-1.5 text-xs font-medium">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className={cn(
              "inset-y-4 left-4 flex h-auto w-full flex-col gap-0 rounded-4xl border-none p-0",
              "sm:max-w-md",
            )}
          >
            <SheetHeader className="px-5 pt-6 text-left">
              <SheetTitle className="text-xl">Фильтры</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-5">
              <Accordion
                type="multiple"
                className="w-full"
                defaultValue={filters.map((f) => f.key)}
              >
                {filters.map((filter) => (
                  <AccordionItem
                    key={filter.key}
                    value={filter.key}
                    className="border-b-0"
                  >
                    <AccordionTrigger className="text-muted-foreground text-base font-medium hover:no-underline">
                      {filter.label}
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-wrap gap-2 pt-2 pb-6">
                      {filter.options.map((opt) => {
                        const isChecked = searchParams
                          .getAll(filter.key)
                          .includes(opt);

                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              handleCheck(filter.key, opt, !isChecked)
                            }
                            aria-pressed={isChecked}
                            data-state={isChecked ? "checked" : "unchecked"}
                            className={cn(
                              "border-chart-1 text-muted-foreground transition-[border, font, outline] flex h-12 cursor-pointer items-center justify-center rounded-full border text-base duration-200 outline-none",
                              "hover:border-black-muted border-ring/50 hover:border-muted-foreground",
                              filter.type === "oval" && "w-fit px-4",
                              filter.type === "round" && "w-12",
                              "focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-1",
                              "data-[state=checked]:border-foreground data-[state=checked]:ring-foreground data-[state=checked]:text-foreground data-[state=checked]:font-medium data-[state=checked]:ring-1 data-[state=checked]:ring-inset",
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div className="bg-background mt-auto rounded-4xl p-5">
              <Button
                disabled={activeFiltersCount === 0 && currentSort === "newest"}
                className={cn(
                  "bg-card text-foreground h-12 w-full gap-4 rounded-[16px] px-4 text-base font-medium",
                  "duration-300 hover:bg-gray-200",
                )}
                onClick={handleReset}
              >
                Сбросить все
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {activeFiltersCount > 0 && (
          <Button
            onClick={handleReset}
            className={cn(
              "bg-card text-foreground h-12 gap-4 rounded-[16px] px-4 text-base font-medium",
              "duration-300 hover:bg-gray-200",
            )}
          >
            <X className="size-4" />
            Сбросить
          </Button>
        )}
      </div>
    </div>
  );
};
