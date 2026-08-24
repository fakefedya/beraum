"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type CatalogProduct } from "@/src/server/actions/products.queries";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { getSwatchStyle } from "@/src/lib/constants";
import { buildImageUrl, cn } from "@/src/lib/utils";
import { SafeImage } from "./SafeImage";

const VISIBLE_COLORS_LIMIT = 4;

interface ProductCardProps {
  product: CatalogProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const searchParams = useSearchParams();

  const matchedVariant = useMemo(() => {
    const selectedColors = searchParams
      .getAll("color")
      .map((c) => c.toLowerCase().trim());

    if (selectedColors.length > 0) {
      const exactMatch = product.variants.find(
        (v) =>
          v.colorName &&
          selectedColors.includes(v.colorName.toLowerCase().trim()),
      );
      if (exactMatch) return exactMatch;

      const partialMatch = product.variants.find(
        (v) =>
          v.colorName &&
          selectedColors.some((sc) => v.colorName!.toLowerCase().includes(sc)),
      );
      if (partialMatch) return partialMatch;
    }

    return product.variants[0];
  }, [product.variants, searchParams]);

  const [selectedVariantId, setSelectedVariantId] = useState(matchedVariant.id);
  const [prevMatchedId, setPrevMatchedId] = useState(matchedVariant.id);

  if (matchedVariant.id !== prevMatchedId) {
    setPrevMatchedId(matchedVariant.id);
    setSelectedVariantId(matchedVariant.id);
  }

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) || matchedVariant;

  const visibleVariants = product.variants.slice(0, VISIBLE_COLORS_LIMIT);
  const hiddenCount = product.variants.length - VISIBLE_COLORS_LIMIT;
  const imageUrl = buildImageUrl(activeVariant.image);

  return (
    <article
      className={cn(
        "group bg-card relative rounded-4xl border-2 border-transparent px-4 pt-4 pb-6",
        "hover:border-brand transition-border duration-300",
      )}
    >
      <div className="relative flex flex-col gap-4">
        <div className="bg-accent relative flex aspect-4/5 items-center justify-center overflow-hidden rounded-xl">
          <SafeImage
            src={imageUrl}
            alt={`${product.productType} ${product.siteArticle}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "transition-transform duration-500 group-hover:scale-102",
              activeVariant.image?.fit === "cover"
                ? "object-cover"
                : "object-contain",
            )}
          />
        </div>

        <div
          className="z-1 flex items-center justify-center gap-2"
          role="radiogroup"
          aria-label="Выберите цвет"
        >
          {visibleVariants.map((variant) => {
            const isActive = activeVariant.id === variant.id;
            const colorLabel = variant.colorName || "Стандарт";

            return (
              <TooltipProvider key={variant.id} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      role="radio"
                      onClick={() => setSelectedVariantId(variant.id)}
                      aria-checked={isActive}
                      className={cn(
                        "flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 transition-all duration-200 outline-none",
                        "md:h-4 md:w-4",
                        isActive && product.variants.length > 1
                          ? "ring-brand-secondary ring-2 ring-offset-2"
                          : "hover:ring-2 hover:ring-black/20 hover:ring-offset-1",
                      )}
                    >
                      <span
                        className="block h-full w-full rounded-full"
                        style={getSwatchStyle(variant.colorName)}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    sideOffset={8}
                    className="rounded-lg border-none bg-black px-3 py-1.5 text-white shadow-xl"
                  >
                    <span className="text-xs font-medium whitespace-nowrap">
                      {colorLabel}
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
            <span className="text-foreground mt-8">
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
        aria-label={`Перейти к товару ${product.siteArticle}`}
        className={cn(
          "rounded focus-visible:ring-2",
          "focus-visible:ring-black",
          "after:absolute after:inset-0",
        )}
      />
    </article>
  );
};
