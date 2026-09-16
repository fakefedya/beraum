import { cn } from "@/src/lib/utils";
import { DiscountCard } from "./DiscountCard";
import type { DiscountMedia } from "@/src/server/db/schema/discount.schema";
import { EmptyState } from "@/src/components/ui/empty-state";

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
      <EmptyState
        title="Товары не найдены"
        description="Попробуйте изменить параметры фильтрации."
      />
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
