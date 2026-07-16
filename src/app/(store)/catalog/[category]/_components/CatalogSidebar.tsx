"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CATEGORY_FILTERS } from "@/src/lib/constants";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface CatalogSidebarProps {
  categorySlug: string;
}

export const CatalogSidebar = ({ categorySlug }: CatalogSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = CATEGORY_FILTERS[categorySlug];
  const currentSort = searchParams.get("sort") || "newest";

  const handleSort = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (value === "newest") {
      current.delete("sort");
    } else {
      current.set("sort", value);
    }

    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  if (!filters || filters.length === 0) return null;

  const hasActiveFilters = filters.some((f) => searchParams.has(f.key));
  const hasActiveSort =
    searchParams.has("sort") && searchParams.get("sort") !== "newest";
  const canReset = hasActiveFilters || hasActiveSort;

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
    router.push(pathname, { scroll: false });
  };

  return (
    <aside className="w-full shrink-0 xl:w-64">
      <div className="pb-6">
        <h3 className="pb-4 text-sm font-normal hover:no-underline">
          Сортировка
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "newest", label: "По умолчанию" },
            { value: "price_asc", label: "Дешевле" },
            { value: "price_desc", label: "Дороже" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSort(option.value)}
              className={cn(
                "text-muted-foreground border-chart-1 transition-[border, font, outline] flex h-10 w-fit cursor-pointer items-center justify-center rounded-full border px-4 text-sm duration-200 outline-none",
                "focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-1",
                currentSort === option.value
                  ? "border-foreground ring-foreground font-medium ring-1 ring-inset"
                  : "border-ring hover:border-muted-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <Accordion
        type="multiple"
        // defaultValue={filters.map((f) => f.key)}
        className="w-full"
      >
        {filters.map((filter) => (
          <AccordionItem
            key={filter.key}
            value={filter.key}
            className="border-b-0"
          >
            <AccordionTrigger className="text-sm font-normal hover:no-underline">
              {filter.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-wrap gap-2 pt-2 pb-6">
              {filter.options.map((opt) => {
                const isChecked = searchParams.getAll(filter.key).includes(opt);

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleCheck(filter.key, opt, !isChecked)}
                    aria-pressed={isChecked}
                    data-state={isChecked ? "checked" : "unchecked"}
                    className={cn(
                      "text-muted-foreground border-chart-1 transition-[border, font, outline] hover:border-black-muted border-ring hover:border-muted-foreground flex h-10 cursor-pointer items-center justify-center rounded-full border text-sm duration-200 outline-none",

                      filter.type === "oval" && "w-fit px-4",
                      filter.type === "round" && "w-10",

                      "focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-1",
                      // Состояние: Активно (выбрано)
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
      <Button
        variant={"rounded"}
        disabled={!canReset}
        className="bg-border mt-4 h-10 w-full"
        onClick={handleReset}
      >
        Сбросить фильтры
      </Button>
    </aside>
  );
};
