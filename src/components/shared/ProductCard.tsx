"use client";

import { useState } from "react";
import Link from "next/link";
import { type CatalogProduct } from "@/src/server/actions/products.queries";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { COLOR_SWATCH_MAP, DEFAULT_SWATCH_COLOR } from "@/src/lib/constants";
import { cn } from "@/src/lib/utils";

const VISIBLE_COLORS_LIMIT = 4;

interface ProductCardProps {
  product: CatalogProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [activeVariant, setActiveVariant] = useState(product.variants[0]);

  const visibleVariants = product.variants.slice(0, VISIBLE_COLORS_LIMIT);
  const hiddenCount = product.variants.length - VISIBLE_COLORS_LIMIT;

  return (
    <article
      className={cn(
        "group bg-card relative rounded-4xl border-2 border-transparent px-4 pt-4 pb-6",
        "hover:border-brand transition-border duration-300",
      )}
    >
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
                className={cn(
                  "flex h-4 w-4 cursor-pointer items-center justify-center rounded-full p-0 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.30),0_0_0_1px_rgba(0,0,0,0.05)]",
                  isActive && product.variants.length > 1
                    ? "border-black ring-1 ring-black ring-offset-2"
                    : "border-black/10 hover:border-black/30",
                )}
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
        className={cn(
          "rounded focus-visible:ring-2",
          "focus-visible:ring-black",
          "after:absolute after:inset-0",
        )}
      ></Link>
    </article>
  );
};
