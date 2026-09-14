import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { cn } from "@/src/lib/utils";
import { SimilarProductsSkeleton } from "../../product/[article]/_components/SimilarProducts";

export default function DiscountProductLoading() {
  return (
    <div className={cn("flex flex-col gap-20", "md:gap-30")}>
      <Section className={cn("pt-24", "md:pt-32")}>
        <Container maxWidth="7xl">
          <div
            className={cn(
              "grid grid-cols-1 gap-12 lg:grid-cols-12",
              "lg:items-start lg:gap-16",
            )}
          >
            {/* Галерея Skeleton */}
            <div
              className={cn(
                "relative z-10 aspect-2/3 w-full rounded-4xl",
                "lg:aspect-auto",
                "lg:sticky lg:top-32 lg:h-[calc(100vh-140px)] lg:min-h-125",
                "lg:col-span-8",
              )}
            >
              <div className="bg-card relative aspect-4/5 w-full animate-pulse overflow-hidden rounded-[24px]" />
            </div>

            {/* Инфо Skeleton */}
            <div className={cn("ml-auto w-full max-w-full", "lg:col-span-4")}>
              <div className="flex flex-col gap-6">
                <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
                <div className="flex flex-col gap-2">
                  <div className="bg-muted h-6 w-32 animate-pulse rounded-sm" />
                  <div className="bg-muted h-10 w-3/4 animate-pulse rounded-sm lg:h-12" />
                  <div className="bg-muted h-4 w-24 animate-pulse rounded-sm" />
                </div>

                <div className="mt-4 flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="bg-muted h-10 w-40 animate-pulse rounded-sm" />
                    <div className="bg-muted h-5 w-28 animate-pulse rounded-sm" />
                  </div>

                  {/* Блок дефекта */}
                  <div className="bg-card h-32 w-full animate-pulse rounded-2xl" />

                  {/* Маркетплейс */}
                  <div className="bg-card h-24 w-full animate-pulse rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <SimilarProductsSkeleton />
    </div>
  );
}
