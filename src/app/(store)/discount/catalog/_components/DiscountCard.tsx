"use client";

import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { buildImageUrl, cn } from "@/src/lib/utils";
import { getSwatchStyle } from "@/src/lib/constants";
import { SafeImage } from "@/src/components/shared/SafeImage";
import type { PublicDiscountItemDTO } from "./DiscountGrid";
import { Barcode } from "lucide-react";

interface DiscountCardProps {
  product: PublicDiscountItemDTO;
}

export const DiscountCard = ({ product }: DiscountCardProps) => {
  const coverMedia =
    product.mediaKeys?.find((m) => m.isCover) || product.mediaKeys?.[0];

  const imageUrl = buildImageUrl(
    coverMedia
      ? { bucketName: "discount-products", fileKey: coverMedia.key }
      : null,
    "discount-products",
  );

  const hasBasePrice = product.basePrice && product.basePrice > 0;
  const savings = hasBasePrice
    ? Math.round(
        ((product.basePrice! - product.discountPrice) / product.basePrice!) *
          100,
      )
    : 0;

  return (
    <article
      className={cn(
        "group bg-card relative flex flex-col rounded-4xl border-2 border-transparent px-4 pt-4 pb-6",
        "hover:border-brand transition-border duration-300",
      )}
    >
      <div className="relative flex flex-col gap-4">
        <div className="bg-accent relative flex aspect-4/5 items-center justify-center overflow-hidden rounded-xl">
          <SafeImage
            src={imageUrl}
            alt={`${product.categoryName} ${product.uniqueSku}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "transition-transform duration-500 group-hover:scale-102",
              coverMedia?.fit === "cover" ? "object-cover" : "object-contain",
            )}
          />

          <div className="absolute top-0 right-0 flex items-center gap-2 p-4">
            {savings > 0 && (
              <Badge className="bg-brand text-foreground text-xs leading-normal font-medium uppercase shadow-sm">
                -{savings}%
              </Badge>
            )}
          </div>
        </div>

        <div className="z-1 flex items-center justify-center gap-2">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full p-0 ring-1 ring-black/10 outline-none",
                    "md:h-4 md:w-4",
                  )}
                >
                  <span
                    className="block h-full w-full rounded-full"
                    style={getSwatchStyle(product.colorName)}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                sideOffset={8}
                className="rounded-lg border-none bg-black px-3 py-1.5 text-white shadow-xl"
              >
                <span className="text-xs font-medium whitespace-nowrap">
                  {product.colorName || "Стандартный"}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-4 flex flex-col gap-0">
          <h2 className="text-muted-foreground">{product.categoryName}</h2>
          <h2 className="font-medium">{product.siteArticle}</h2>

          <div className="text-muted-foreground mt-1 flex items-center gap-1">
            <Barcode size={16} />
            <span className="text-xs font-medium">{product.uniqueSku}</span>
          </div>
        </div>
        <div className="bg-brand/20 text-foreground h-20 rounded-xl p-4">
          <p className="line-clamp-2 text-sm leading-relaxed">
            {product.defectDescription}
          </p>
        </div>

        <div className="mt-2 flex items-end gap-3">
          <span className="text-foreground">
            {product.discountPrice.toLocaleString("ru-RU")} ₽
          </span>
          {hasBasePrice && (
            <span className="text-foreground mb-1 text-balance line-through">
              {product.basePrice!.toLocaleString("ru-RU")} ₽
            </span>
          )}
        </div>
      </div>

      <Link
        href={`/discount/${product.uniqueSku}`}
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
