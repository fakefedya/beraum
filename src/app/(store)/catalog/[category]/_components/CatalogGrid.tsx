import { type CatalogProduct } from "@/src/server/queries/products";
import { cn } from "@/src/lib/utils";
import { ProductCard } from "@/src/components/shared/ProductCard";

interface CatalogGridProps {
  products: CatalogProduct[];
}

export const CatalogGrid = ({ products }: CatalogGridProps) => {
  return (
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
  );
};
