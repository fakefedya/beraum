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
        </form>
        <div className="flex flex-col gap-2">
          <Input
            name="siteArticle"
            form={formId}
            defaultValue={product.siteArticle}
            className="h-8 text-xs font-semibold"
            placeholder="Модель (Группа)"
            required
            disabled={isPending}
          />
          <Input
            name="itemArticle"
            form={formId}
            defaultValue={product.itemArticle}
            className="h-8 font-mono text-[11px] tracking-wider"
            placeholder="Точный SKU"
            required
            disabled={isPending}
          />
        </div>
      </td>

      {/* 2. Остатки (Только для чтения) */}
      <td className="px-4 py-4 align-top">
        <div className="flex flex-col gap-1 text-[11px] tracking-wider uppercase">
          <span className="text-muted-foreground">
            Ozon:{" "}
            <span className="text-foreground font-medium">
              {product.ozonStockFbo ?? 0}
            </span>
          </span>
          <span className="text-muted-foreground">
            WB:{" "}
            <span className="text-foreground font-medium">
              {product.fbsStock ?? 0}
            </span>
          </span>
          <span className="text-muted-foreground">
            Ручн:{" "}
            <span className="text-foreground font-medium">
              {product.manualStock ?? 0}
            </span>
          </span>
        </div>
      </td>

      {/* 3. Статус */}
      <td className="px-4 py-4 align-top">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Черновик</SelectItem>
            <SelectItem value="published">Опубликован</SelectItem>
            <SelectItem value="archived">Архив</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* 4. Скидка */}
      <td className="px-4 py-4 align-top">
        <div className="flex flex-col gap-1">
          <input
            type="number"
            name="discountPercentage"
            form={formId}
            defaultValue={product.discountPercentage}
            className={cn(inputClass, "h-8 w-16")}
            min="0"
            max="100"
          />
          <div className="text-foreground flex h-8 items-center text-[13px] font-medium">
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
            placeholder="Ozon URL"
            className={inputClass}
          />
          <input
            type="url"
            name="wbLink"
            form={formId}
            defaultValue={product.wbLink || ""}
            placeholder="WB URL"
            className={inputClass}
          />
          <input
            type="url"
            name="ymarketLink"
            form={formId}
            defaultValue={product.ymarketLink || ""}
            placeholder="YaMarket URL"
            className={inputClass}
          />
          <input
            type="url"
            name="mvideoLink"
            form={formId}
            defaultValue={product.mvideoLink || ""}
            placeholder="MVideo URL"
            className={inputClass}
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
              "min-h-17.5 resize-y font-mono text-[10px]",
            )}
          />
          <textarea
            name="specifications"
            form={formId}
            defaultValue={JSON.stringify(product.specifications, null, 2)}
            placeholder="Specs (JSON)"
            className={cn(
              inputClass,
              "min-h-17.5 resize-y font-mono text-[10px]",
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
            className="w-full"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span className="ml-2">Сохранить</span>
          </Button>

          <Button variant="outline" size="sm" asChild className="w-full">
            <Link
              href={`/product/${product.itemArticle.toLowerCase()}`}
              target="_blank"
            >
              <ExternalLink className="mr-2 size-4" /> На сайт
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
