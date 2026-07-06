"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWRInfinite from "swr/infinite";
import { getProducts, type CatalogProduct } from "@/src/server/actions/catalog";
import { Button } from "@/src/components/ui/button";
import { COLOR_SWATCH_MAP, DEFAULT_SWATCH_COLOR } from "@/src/lib/constants";

const LIMIT = 12;
const VISIBLE_COLORS_LIMIT = 5;

// === ИЗОЛИРОВАННАЯ КАРТОЧКА ТОВАРА ===
const ProductCard = ({ product }: { product: CatalogProduct }) => {
  // По умолчанию берем первую вариацию из массива
  const [activeVariant, setActiveVariant] = useState(product.variants[0]);

  const visibleVariants = product.variants.slice(0, VISIBLE_COLORS_LIMIT);
  const hiddenCount = product.variants.length - VISIBLE_COLORS_LIMIT;

  return (
    <div className="group hover:shadow-card relative flex flex-col rounded-2xl bg-white p-5 transition-shadow duration-300">
      {/* Фотография (ведет на конкретный SKU) */}
      <Link
        href={`/product/${activeVariant.itemArticle.toLowerCase()}`}
        className="mb-6 block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-black/20"
      >
        <div className="bg-surface-gray text-black-muted flex aspect-[4/5] w-full items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-[1.02]">
          [ Фото: {activeVariant.itemArticle} ]
        </div>
      </Link>

      {/* Селектор цветов (Свотчи) */}
      {product.variants.length > 1 && (
        <div
          className="mb-4 flex items-center gap-1.5"
          role="radiogroup"
          aria-label="Выберите цвет"
        >
          {visibleVariants.map((variant) => {
            const isActive = activeVariant.id === variant.id;
            const hexColor = variant.colorName
              ? COLOR_SWATCH_MAP[variant.colorName] || DEFAULT_SWATCH_COLOR
              : DEFAULT_SWATCH_COLOR;

            return (
              <button
                key={variant.id}
                onClick={() => setActiveVariant(variant)}
                aria-checked={isActive}
                aria-label={`Цвет: ${variant.colorName || "Стандарт"}`}
                title={variant.colorName || "Стандарт"}
                className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border transition-all focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:outline-none ${
                  isActive
                    ? "border-black ring-1 ring-black ring-offset-2"
                    : "border-black/10 hover:border-black/30"
                }`}
                style={{ backgroundColor: hexColor }}
              />
            );
          })}

          {/* Индикатор скрытых цветов */}
          {hiddenCount > 0 && (
            <span className="text-black-muted ml-1 text-xs font-medium">
              +{hiddenCount}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-col">
        {/* Заголовок: Категория + Базовая модель + Цвет */}
        <Link
          href={`/product/${activeVariant.itemArticle.toLowerCase()}`}
          className="rounded outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          <h2 className="mb-2 text-base font-semibold text-black transition-colors group-hover:text-black/80">
            {product.categoryTitle} {product.siteArticle}
            {activeVariant.colorName && ` – ${activeVariant.colorName}`}
          </h2>
        </Link>

        {/* Цена и остатки */}
        <div className="mt-1 flex items-end justify-between">
          <span className="text-lg font-bold tracking-tight text-black">
            {activeVariant.price > 0
              ? `${activeVariant.price.toLocaleString("ru-RU")} ₽`
              : "По запросу"}
          </span>
          <span
            className={`text-xs font-medium ${activeVariant.stock > 0 ? "text-green-600" : "text-red-500"}`}
          >
            {activeVariant.stock > 0 ? "В наличии" : "Под заказ"}
          </span>
        </div>
      </div>
    </div>
  );
};

// === ОСНОВНАЯ СЕТКА КАТАЛОГА ===
interface CatalogGridProps {
  initialData: CatalogProduct[];
  categorySlug: string;
}

export const CatalogGrid = ({
  initialData,
  categorySlug,
}: CatalogGridProps) => {
  const searchParams = useSearchParams();

  const getKey = (
    pageIndex: number,
    previousPageData: CatalogProduct[] | null,
  ) => {
    // Достигнут конец списка
    if (previousPageData && previousPageData.length < LIMIT) return null;

    // Собираем текущие фильтры из URL для передачи на сервер
    const filters: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      const existing = filters[key];
      if (existing) {
        filters[key] = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
      } else {
        filters[key] = value;
      }
    });

    return JSON.stringify({
      categorySlug,
      limit: LIMIT,
      offset: pageIndex * LIMIT,
      filters,
    });
  };

  const fetcher = async (key: string) => {
    const params = JSON.parse(key);
    const response = await getProducts(params);
    if (!response.success) throw new Error(response.error);
    return response.data;
  };

  const { data, error, size, setSize, isValidating, isLoading } =
    useSWRInfinite(getKey, fetcher, {
      // Важно: если в URL есть фильтры, initialData может быть устаревшей,
      // но в нашей архитектуре SSR (в page.tsx) уже применяет эти фильтры к initialData,
      // так что fallbackData всегда синхронизирована с текущим URL.
      fallbackData: initialData.length > 0 ? [initialData] : [],
      revalidateFirstPage: false,
      revalidateOnFocus: true,
    });

  // Схлопываем массив страниц в плоский список товаров
  const products = data ? data.flat() : [];

  // Проверяем статус загрузки новых страниц или применения новых фильтров
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < LIMIT);

  if (error) {
    return (
      <div className="py-12 text-center font-medium text-red-500">
        Ошибка синхронизации данных каталога.
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-black-muted py-12 text-center">
        По вашему запросу товары не найдены.
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-12">
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.siteArticle} product={product} />
        ))}
      </div>

      {!isReachingEnd && (
        <Button
          variant="outline"
          size="lg"
          onClick={() => setSize(size + 1)}
          disabled={isLoadingMore || isValidating}
          className="min-w-[200px]"
        >
          {isLoadingMore ? "Загрузка..." : "Показать еще"}
        </Button>
      )}
    </div>
  );
};
