"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProductAction } from "@/src/server/actions/admin-products";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import type { products } from "@/src/server/db/schema";
import { cn } from "@/src/lib/utils";
import { ExternalLink, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { ProductMediaManager } from "./ProductMediaManager";
import { Input } from "@/src/components/ui/input";

type ProductItem = typeof products.$inferSelect;

const inputClass =
  "border-input bg-background focus-visible:ring-ring flex w-full rounded-md border px-3 py-1.5 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:outline-none disabled:opacity-50";

export const ProductRow = ({ product }: { product: ProductItem }) => {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>(product.status);
  const [isLatest, setIsLatest] = useState<string>(
    product.isLatest ? "true" : "false",
  );
  const formId = `form-${product.id}`;

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProductAction(formData);
      if (result.success) {
        toast.success(`Товар ${product.itemArticle} обновлен`);
      } else {
        toast.error(result.error || "Ошибка сохранения");
      }
    });
  };

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      {/* 1. Артикул / SKU */}
      <td className="px-4 py-4 align-top">
        <form id={formId} action={handleAction} className="hidden">
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="isLatest" value={isLatest} />
        </form>
        <div className="flex flex-col gap-2">
          <Input
            name="itemArticle"
            form={formId}
            defaultValue={product.itemArticle}
            className="h-8 font-medium shadow-none"
            placeholder="Точный SKU"
            required
            disabled={isPending}
          />
          <Input
            name="siteArticle"
            form={formId}
            defaultValue={product.siteArticle}
            className="text-foreground/60 h-8 shadow-none"
            placeholder="Модель (Группа)"
            required
            disabled={isPending}
          />
        </div>
      </td>

      {/* 2. Остатки (Только для чтения) */}
      <td className="px-4 py-4 align-top">
        <div className="flex flex-col gap-2 text-xs tracking-wider uppercase">
          <div className="text-muted-foreground flex h-8 flex-nowrap items-center gap-0.5">
            <span className="text-muted-foreground">FBO:</span>
            <span className="text-foreground font-medium">
              {product.ozonStockFbo ?? 0}
            </span>
          </div>
          <div className="text-muted-foreground flex h-8 flex-nowrap items-center gap-0.5">
            <span className="text-muted-foreground">FBS: </span>
            <span className="text-foreground font-medium">
              {product.fbsStock ?? 0}
            </span>
          </div>
        </div>
      </td>

      {/* 3. Статус */}
      <td className="px-4 py-4 align-top">
        <div className="flex flex-col gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-full text-xs font-medium shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Черновик</SelectItem>
              <SelectItem value="published">Опубликован</SelectItem>
              <SelectItem value="archived">Архив</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={isLatest}
            onValueChange={setIsLatest}
            disabled={isPending}
          >
            <SelectTrigger
              className={cn(
                "h-8 w-full text-xs font-medium shadow-none",
                isLatest === "true"
                  ? "bg-brand/20 text-brand-secondary-muted dark:bg-brand/10 dark:text-brand"
                  : "bg-muted text-foreground",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Базовый</SelectItem>
              <SelectItem value="true">Новинка</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </td>

      {/* 4. Скидка */}
      <td className="px-4 py-4 align-top">
        <div className="flex flex-col gap-2">
          <input
            type="number"
            name="discountPercentage"
            form={formId}
            defaultValue={product.discountPercentage}
            className={cn(inputClass, "h-8 w-full bg-transparent shadow-none")}
            min="0"
            max="100"
          />
          <input
            name="manualPrice"
            form={formId}
            defaultValue={product.manualPrice ? product.manualPrice : 0}
            className={cn(
              inputClass,
              "h-8 w-full bg-transparent font-medium shadow-none",
            )}
          />
          <div className="text-muted-foreground bg-foreground/5 flex h-8 items-center rounded-md px-3 text-xs font-medium">
            {product.wbDiscountedPrice != null
              ? new Intl.NumberFormat("ru-RU", {
                  style: "currency",
                  currency: "RUB",
                  maximumFractionDigits: 0,
                }).format(product.wbDiscountedPrice)
              : "—"}
          </div>
        </div>
      </td>

      {/* 5. Маркетплейсы */}
      <td className="px-4 py-4 align-top">
        <div className="flex flex-col gap-2">
          <input
            type="url"
            name="ozonLink"
            form={formId}
            defaultValue={product.ozonLink || ""}
            placeholder="OZON"
            className={cn(
              inputClass,
              "placeholder:text-muted-foreground text-foreground h-8 w-full bg-transparent font-medium shadow-none placeholder:font-normal",
            )}
          />
          <input
            type="url"
            name="wbLink"
            form={formId}
            defaultValue={product.wbLink || ""}
            placeholder="WB"
            className={cn(
              inputClass,
              "placeholder:text-muted-foreground text-foreground h-8 w-full bg-transparent font-medium shadow-none placeholder:font-normal",
            )}
          />
          <input
            type="url"
            name="ymarketLink"
            form={formId}
            defaultValue={product.ymarketLink || ""}
            placeholder="ЯНДЕКС МАРКЕТ"
            className={cn(
              inputClass,
              "placeholder:text-muted-foreground text-foreground h-8 w-full bg-transparent font-medium shadow-none placeholder:font-normal",
            )}
          />
          <input
            type="url"
            name="mvideoLink"
            form={formId}
            defaultValue={product.mvideoLink || ""}
            placeholder="М.ВИДЕО"
            className={cn(
              inputClass,
              "placeholder:text-muted-foreground text-foreground h-8 w-full bg-transparent font-medium shadow-none placeholder:font-normal",
            )}
          />
        </div>
      </td>

      {/* 6. Свойства JSON */}
      <td className="px-4 py-4 align-top">
        <div className="flex flex-col gap-2">
          <textarea
            name="filters"
            form={formId}
            defaultValue={JSON.stringify(product.filters, null, 2)}
            placeholder="Filters (JSON)"
            className={cn(
              inputClass,
              "min-h-18 resize-y bg-transparent font-mono text-xs shadow-none",
            )}
          />
          <textarea
            name="specifications"
            form={formId}
            defaultValue={JSON.stringify(product.specifications, null, 2)}
            placeholder="Specs (JSON)"
            className={cn(
              inputClass,
              "min-h-18 resize-y bg-transparent font-mono text-xs shadow-none",
            )}
          />
        </div>
      </td>

      {/* 7. Действия */}
      <td className="px-4 py-4 text-right align-top">
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form={formId}
            disabled={isPending}
            size="sm"
            className="w-fit"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span className="text-sm">Сохранить</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="hover:bg-background/60 w-full border-none shadow-none"
          >
            <Link
              href={`/product/${product.itemArticle.toLowerCase()}`}
              target="_blank"
              className="flex w-full gap-2"
            >
              <ExternalLink className="size-4" />
              <span className="text-sm">На сайт</span>
            </Link>
          </Button>

          <ProductMediaManager
            productId={product.id}
            article={product.itemArticle}
          />
        </div>
      </td>
    </tr>
  );
};
