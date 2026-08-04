"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useSWRInfinite from "swr/infinite";
import {
  getProducts,
  type CatalogProduct,
} from "@/src/server/actions/products.queries";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { ProductCard } from "@/src/components/shared/ProductCard"; // Импортируем общую карточку

const LIMIT = 12;

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
    if (previousPageData && previousPageData.length < LIMIT) return null;

    const filters: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      if (key === "sort") return;
      const existing = filters[key];
      if (existing) {
        filters[key] = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
      } else {
        filters[key] = value;
      }
    });

    const sort = searchParams.get("sort") || "newest";
    return JSON.stringify({
      categorySlug,
      limit: LIMIT,
      offset: pageIndex * LIMIT,
      filters,
      sort,
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
      fallbackData: initialData.length > 0 ? [initialData] : [],
      revalidateFirstPage: false,
      revalidateOnFocus: true,
    });

  useEffect(() => {
    setSize(1);
  }, [searchParams.toString(), setSize]);

  const products = data ? data.flat() : [];

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
      <div
        className={cn(
          "grid w-full grid-cols-1 gap-2",
          "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3",
        )}
      >
        {products.map((product) => (
          <ProductCard key={product.siteArticle} product={product} />
        ))}
      </div>

      {!isReachingEnd && (
        <Button
          onClick={() => setSize(size + 1)}
          disabled={isLoadingMore || isValidating}
          className={cn(
            "bg-card text-foreground h-12 gap-4 rounded-[16px] px-8 text-base font-medium",
            "duration-300 hover:bg-gray-200",
          )}
        >
          {isLoadingMore ? "Загрузка..." : "Показать еще"}
        </Button>
      )}
    </div>
  );
};
