"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useSWRInfinite from "swr/infinite";
import { type CatalogProduct } from "@/src/server/queries/products"; // Изменен импорт!
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { ProductCard } from "@/src/components/shared/ProductCard";

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

    const url = new URL(
      "/api/products",
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000",
    );

    url.searchParams.set("categorySlug", categorySlug);
    url.searchParams.set("limit", LIMIT.toString());
    url.searchParams.set("offset", (pageIndex * LIMIT).toString());
    url.searchParams.set("sort", searchParams.get("sort") || "newest");

    searchParams.forEach((value, key) => {
      if (key !== "sort") url.searchParams.append(key, value);
    });

    return url.toString();
  };

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not ok");
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
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
          "md:grid-cols-2 lg:grid-cols-3",
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
