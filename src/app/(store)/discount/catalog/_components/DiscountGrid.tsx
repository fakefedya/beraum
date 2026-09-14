import { cn } from "@/src/lib/utils";
import { DiscountCard } from "./DiscountCard";
import type { DiscountMedia } from "@/src/server/db/schema/discount.schema";

export type PublicDiscountItemDTO = {
  id: string;
  uniqueSku: string;
  defectDescription: string;
  discountPrice: number;
  mediaKeys: DiscountMedia[];
  baseItemArticle: string;
  siteArticle: string;
  categoryName: string;
  colorName: string | null;
  basePrice: number | null;
};

interface DiscountGridProps {
  products: PublicDiscountItemDTO[];
}

export const DiscountGrid = ({ products }: DiscountGridProps) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-card flex min-h-[300px] w-full flex-col items-center justify-center gap-4 rounded-2xl border text-center">
        <h3 className="text-xl font-medium">Товаров не найдено</h3>
        <p className="text-muted-foreground max-w-sm">
          Возможно, они уже были выкуплены. Попробуйте выбрать другую категорию.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-2",
        "md:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {products.map((product) => (
        <DiscountCard key={product.id} product={product} />
      ))}
    </div>
  );
};
