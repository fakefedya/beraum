"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CATEGORY_FILTERS } from "@/src/lib/constants";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Button } from "@/src/components/ui/button";

interface CatalogSidebarProps {
  categorySlug: string;
}

export const CatalogSidebar = ({ categorySlug }: CatalogSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = CATEGORY_FILTERS[categorySlug];

  // Если для категории не описаны фильтры в конфиге, ничего не рендерим
  if (!filters || filters.length === 0) return null;

  const hasActiveFilters = filters.some((f) => searchParams.has(f.key));

  // Логика добавления/удаления параметров в URL
  const handleCheck = (key: string, value: string, checked: boolean) => {
    // Копируем текущие параметры URL
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    // В URL может быть несколько одинаковых ключей: ?type=A&type=B
    const existingValues = current.getAll(key);

    // Удаляем все старые значения этого ключа из объекта
    current.delete(key);

    if (checked) {
      // Возвращаем старые + добавляем новое
      existingValues.forEach((v) => current.append(key, v));
      current.append(key, value);
    } else {
      // Возвращаем старые, кроме того, которое отжали
      existingValues
        .filter((v) => v !== value)
        .forEach((v) => current.append(key, v));
    }

    // Обновляем URL без полной перезагрузки страницы (scroll: false оставляет экран на месте)
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <aside className="w-full shrink-0 xl:w-64">
      <Accordion
        type="multiple"
        // По умолчанию раскрываем все аккордеоны
        defaultValue={filters.map((f) => f.key)}
        className="w-full"
      >
        {filters.map((filter) => (
          <AccordionItem
            key={filter.key}
            value={filter.key}
            className="border-black/5"
          >
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              {filter.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3 pt-2 pb-4">
              {filter.options.map((opt) => {
                // Проверяем, есть ли этот конкретный option в текущем URL
                const isChecked = searchParams.getAll(filter.key).includes(opt);

                return (
                  <label
                    key={opt}
                    className="group flex cursor-pointer items-center gap-3"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(c) =>
                        handleCheck(filter.key, opt, c as boolean)
                      }
                      className="border-black/20 data-[state=checked]:border-black data-[state=checked]:bg-black"
                    />
                    <span className="text-black-muted text-sm font-medium transition-colors group-hover:text-black">
                      {opt}
                    </span>
                  </label>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {hasActiveFilters && (
        <Button variant="outline" className="mb-4 w-full" onClick={handleReset}>
          Сбросить фильтры
        </Button>
      )}
    </aside>
  );
};
