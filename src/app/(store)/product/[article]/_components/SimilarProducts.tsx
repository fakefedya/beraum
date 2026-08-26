import { getSimilarProducts } from "@/src/server/queries/products";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { ProductCard } from "@/src/components/shared/ProductCard";
import { cn } from "@/src/lib/utils";

interface SimilarProductsProps {
  categoryId: string;
  excludeSiteArticle: string;
}
export const SimilarProductsSkeleton = () => (
  <Section>
    <Container maxWidth="7xl" className="gap-8">
      <div className="bg-muted h-9 w-64 animate-pulse rounded-md md:h-10" />

      <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <article
            key={i}
            className="bg-card relative rounded-4xl border-2 border-transparent px-4 pt-4 pb-6"
          >
            <div className="relative flex flex-col gap-4">
              <div className="bg-accent aspect-4/5 w-full animate-pulse rounded-xl" />
              <div className="z-1 flex items-center justify-center gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="bg-muted h-6 w-6 shrink-0 animate-pulse rounded-full md:h-4 md:w-4"
                  />
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-1">
                <div className="bg-muted h-4 w-1/2 animate-pulse rounded-sm" />
                <div className="bg-muted mt-1 h-5 w-3/4 animate-pulse rounded-sm" />
                <div className="bg-muted mt-7 h-6 w-1/3 animate-pulse rounded-sm" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </Container>
  </Section>
);

export async function SimilarProducts({
  categoryId,
  excludeSiteArticle,
}: SimilarProductsProps) {
  const response = await getSimilarProducts(categoryId, excludeSiteArticle, 3);
  const products = response.data || [];

  if (products.length === 0) return null;

  return (
    <Section>
      <Container maxWidth="7xl" className="gap-8">
        <h2 className={cn("text-center text-3xl font-medium", "md:text-4xl")}>
          Похожие модели
        </h2>
        <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.siteArticle} product={product} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
