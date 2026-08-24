"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  CATEGORY_FILTERS,
  COLOR_SWATCH_MAP,
  DEFAULT_SWATCH_COLOR,
  getSwatchStyle,
} from "@/src/lib/constants";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
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

  // Подсчет количества активных фильтров для бэйджа
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "bg-card text-foreground h-12 gap-4 rounded-lg px-3 text-base font-medium",
                "duration-300 hover:bg-gray-200",
                "md:rounded-[16px] md:px-4",
              )}
            >
              <ArrowDownUp className="size-4" />
              <span className="hidden md:inline">
                {SORT_OPTIONS.find((o) => o.value === currentSort)?.label}
              </span>
              <span className="md:hidden">Сортировка</span>
              <ChevronDown
                className={cn(
                  "size-4 opacity-50 transition-transform duration-300",
                  "group-data-[state=open]:rotate-180",
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className={cn(
              "shadow-card w-48 rounded-lg border-none p-1.5",
              "md:rounded-[16px]",
            )}
          >
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSort(option.value)}
                className={cn(
                  "cursor-pointer rounded-xl p-3 text-base transition-colors",
                  "hover:bg-hover-background/80 focus:hover-background/80",
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
                "bg-card text-foreground h-12 gap-4 rounded-lg px-3 text-base font-medium",
                "duration-300 hover:bg-gray-200",
                "md:rounded-[16px] md:px-4",
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
              "flex h-auto w-full flex-col gap-0 border-none p-0",
              "sm:max-w-md",
              "md:inset-y-4 md:left-4 md:rounded-4xl",
            )}
          >
            <SheetHeader className="px-6 pt-6 text-left">
              <SheetTitle className="text-xl">Фильтры</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6">
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
                    <AccordionTrigger className="text-foreground text-base hover:no-underline">
                      {filter.label}
                    </AccordionTrigger>
                    <AccordionContent
                      className={cn(
                        "pt-2 pb-6",
                        filter.key === "color"
                          ? "flex flex-wrap gap-2"
                          : "flex flex-col gap-2",
                      )}
                    >
                      {filter.options.map((opt) => {
                        const isChecked = searchParams
                          .getAll(filter.key)
                          .includes(opt);

                        if (filter.key === "color") {
                          return (
                            <TooltipProvider key={opt} delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCheck(filter.key, opt, !isChecked)
                                    }
                                    aria-pressed={isChecked}
                                    className={cn(
                                      "mx-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 transition-all duration-200 outline-none",
                                      "focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                                      isChecked
                                        ? "ring-brand-secondary ring-2 ring-offset-2"
                                        : "hover:ring-2 hover:ring-black/20 hover:ring-offset-1",
                                    )}
                                  >
                                    <span
                                      className="block h-full w-full rounded-full"
                                      style={getSwatchStyle(opt)}
                                    />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  className="rounded-lg border-none bg-black px-3 py-1.5 text-white shadow-xl"
                                >
                                  <span className="text-sm font-medium whitespace-nowrap">
                                    {opt}
                                  </span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        }

                        return (
                          <label
                            key={opt}
                            className="group flex w-fit cursor-pointer items-center gap-3"
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleCheck(filter.key, opt, checked === true)
                              }
                            />
                            <span className="text-muted-foreground group-hover:text-foreground text-base transition-colors select-none">
                              {opt}
                            </span>
                          </label>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="bg-background mt-auto rounded-4xl p-6">
              <Button
                disabled={activeFiltersCount === 0}
                className={cn(
                  "bg-card text-foreground h-12 w-full gap-4 rounded-[16px] px-4 text-base font-medium",
                  "duration-300 hover:bg-gray-200",
                )}
                onClick={handleReset}
              >
                Сбросить фильтры
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {activeFiltersCount > 0 && (
          <Button
            onClick={handleReset}
            className={cn(
              "bg-card text-foreground h-12 gap-4 rounded-lg px-3 text-base font-medium",
              "duration-300 hover:bg-gray-200",
              "md:rounded-[16px] md:px-4",
            )}
          >
            <X className="size-4" />
            <span className="hidden md:inline">Сбросить</span>
          </Button>
        )}
      </div>
    </div>
  );
};
