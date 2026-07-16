"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWRInfinite from "swr/infinite";
import {
  getProducts,
  type CatalogProduct,
} from "@/src/server/actions/products.queries";
import { Button } from "@/src/components/ui/button";
import { COLOR_SWATCH_MAP, DEFAULT_SWATCH_COLOR } from "@/src/lib/constants";
import { Badge } from "@/src/components/ui/badge";

const LIMIT = 12;
const VISIBLE_COLORS_LIMIT = 4;

interface CatalogGridProps {
  initialData: CatalogProduct[];
  categorySlug: string;
}

const ProductCard = ({ product }: { product: CatalogProduct }) => {
  const [activeVariant, setActiveVariant] = useState(product.variants[0]);

  const visibleVariants = product.variants.slice(0, VISIBLE_COLORS_LIMIT);
  const hiddenCount = product.variants.length - VISIBLE_COLORS_LIMIT;
  return (
    <article className="hover:border-brand transition-border group bg-card relative rounded-4xl border-2 border-transparent px-4 pt-4 pb-6 duration-300">
      <div className="relative flex flex-col gap-4">
        <div className="bg-accent flex aspect-4/5 items-center justify-center rounded-xl"></div>
        <div
          className="z-1 flex items-center justify-center gap-2"
          role="radiogroup"
          aria-label="Выберите цвет"
        >
          {visibleVariants.map((variant) => {
            const isActive = activeVariant.id === variant.id;
            const hexColor = variant.colorName
              ? COLOR_SWATCH_MAP[variant.colorName] || DEFAULT_SWATCH_COLOR
              : DEFAULT_SWATCH_COLOR;

            return (
              <Button
                key={variant.id}
                onClick={() => setActiveVariant(variant)}
                aria-checked={isActive}
                title={variant.colorName || "Стандарт"}
                className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded-full p-0 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.30),0_0_0_1px_rgba(0,0,0,0.05)] ${
                  isActive && product.variants.length > 1
                    ? "border-black ring-1 ring-black ring-offset-2"
                    : "border-black/10 hover:border-black/30"
                }`}
                style={{ backgroundColor: hexColor }}
              />
            );
          })}
          {hiddenCount > 0 && (
            <span className="text-black-muted ml-1 text-xs font-medium">
              +{hiddenCount}
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-0">
          <h2 className="text-muted-foreground">{product.productType}</h2>
          <h2 className="font-medium">{product.siteArticle}</h2>
          {activeVariant.price > 0 ? (
            <span className="text-muted-foreground mt-8">
              от {activeVariant.price.toLocaleString("ru-RU")} ₽
            </span>
          ) : (
            <span className="mt-8">По запросу</span>
          )}
        </div>
        <div className="absolute top-0 right-0 flex items-center gap-2">
          {activeVariant.stock <= 0 && (
            <Badge className="bg-background text-foreground text-xs leading-normal font-medium uppercase">
              Под заказ
            </Badge>
          )}
          {activeVariant.isLatest && (
            <Badge className="bg-brand text-foreground text-xs leading-normal font-medium uppercase">
              Новинка
            </Badge>
          )}
        </div>
      </div>
      <Link
        href={`/product/${activeVariant.itemArticle.toLowerCase()}`}
        className="rounded after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-black"
      ></Link>
    </article>
  );
};

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
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
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
          className="min-w-50"
        >
          {isLoadingMore ? "Загрузка..." : "Показать еще"}
        </Button>
      )}
    </div>
  );
};
