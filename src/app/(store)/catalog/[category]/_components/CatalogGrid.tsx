"use client";

import { useState } from "react";
import useSWRInfinite from "swr/infinite";
import { getProducts, type CatalogProduct } from "@/src/server/actions/catalog";
import { Button } from "@/src/components/ui/button";

const LIMIT = 12;

// === ИЗОЛИРОВАННАЯ КАРТОЧКА ТОВАРА ===
const ProductCard = ({ product }: { product: CatalogProduct }) => {
  // По умолчанию берем первую вариацию из массива
  const [activeVariant, setActiveVariant] = useState(product.variants[0]);
  console.log(
    "Артикул:",
    product.siteArticle,
    "Варианты:",
    product.variants.length,
  );
  return (
    <div className="flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="bg-surface-gray text-black-muted mb-4 flex aspect-square items-center justify-center rounded-lg">
        [ Фото: {activeVariant.itemArticle} ]
      </div>
      <div className="text-brand-muted mb-1 text-xs font-semibold tracking-wider uppercase">
        {product.categoryTitle}
      </div>
      <h2
        className="mb-4 text-lg leading-tight font-bold"
        title={activeVariant.itemArticle}
      >
        {product.categoryTitle} {activeVariant.itemArticle}
        {activeVariant.colorName && (
          <span className="text-black-muted mt-1 block text-sm font-normal">
            Цвет: {activeVariant.colorName}
          </span>
        )}
      </h2>

      {/* === СЕЛЕКТОР ЦВЕТОВ === */}
      {product.variants.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => setActiveVariant(variant)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeVariant.id === variant.id
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
              }`}
            >
              {variant.colorName || "Стандарт"}
            </button>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-2">
        <div className="text-xl font-extrabold">
          {activeVariant.price > 0
            ? `${activeVariant.price.toLocaleString("ru-RU")} ₽`
            : "Цена по запросу"}
        </div>
        <div
          className={`rounded-full px-2 py-1 text-xs font-medium ${activeVariant.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {activeVariant.stock > 0
            ? `Остаток: ${activeVariant.stock}`
            : "Под заказ"}
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
  const getKey = (
    pageIndex: number,
    previousPageData: CatalogProduct[] | null,
  ) => {
    if (previousPageData && previousPageData.length < LIMIT) return null;
    return JSON.stringify({
      categorySlug,
      limit: LIMIT,
      offset: pageIndex * LIMIT,
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

  const products = data ? data.flat() : [];
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < LIMIT);

  if (error)
    return (
      <div className="py-12 text-center font-medium text-red-500">
        Ошибка синхронизации данных каталога.
      </div>
    );
  if (isEmpty)
    return (
      <div className="text-black-muted py-12 text-center">
        Товары в данной категории пока отсутствуют.
      </div>
    );

  return (
    <div className="flex w-full flex-col items-center gap-12">
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
