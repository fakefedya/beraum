import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { cn } from "@/src/lib/utils";

const DiscountCardSkeleton = () => (
  <article
    className={cn(
      "bg-card relative flex flex-col rounded-4xl border-2 border-transparent px-4 pt-4 pb-6",
    )}
  >
    <div className="relative flex flex-col gap-4">
      {/* Изображение и бейджи */}
      <div className="bg-accent relative flex aspect-4/5 animate-pulse items-center justify-center overflow-hidden rounded-xl">
        <div className="absolute top-4 right-4 h-5 w-12 rounded-full bg-black/10" />
      </div>

      {/* Цвет */}
      <div className="z-1 flex items-center justify-center gap-2">
        <div className="bg-muted h-6 w-6 shrink-0 animate-pulse rounded-full ring-1 ring-black/10 md:h-4 md:w-4" />
      </div>

      {/* Категория, артикул и штрихкод */}
      <div className="mt-4 flex flex-col gap-1.5">
        <div className="bg-muted h-4 w-1/2 animate-pulse rounded-sm" />
        <div className="bg-muted h-5 w-3/4 animate-pulse rounded-sm" />
        <div className="bg-muted mt-1 h-4 w-1/3 animate-pulse rounded-sm" />
      </div>

      {/* Блок описания дефекта */}
      <div className="bg-brand/10 h-20 w-full animate-pulse rounded-xl" />

      {/* Цена */}
      <div className="mt-2 flex items-end gap-3">
        <div className="bg-muted h-6 w-24 animate-pulse rounded-sm" />
        <div className="bg-muted mb-1 h-4 w-16 animate-pulse rounded-sm" />
      </div>
    </div>
  </article>
);

export default function DiscountCatalogLoading() {
  return (
    <div className="flex flex-col gap-10">
      <Section>
        <Container className={cn("pt-24", "md:pt-32")}>
          {/* Хлебные крошки */}
          <div className="flex justify-center">
            <div className="bg-muted h-5 w-48 animate-pulse rounded-md" />
          </div>
        </Container>
      </Section>

      <Section>
        <Container maxWidth="7xl" className="gap-5">
          <div className="flex flex-col gap-6">
            {/* Сайдбар */}
            <div className="sticky top-20 z-10 flex w-full items-center justify-center md:top-24">
              <div className="bg-background/80 shadow-nav flex w-full items-center gap-1.5 rounded-xl p-1.5 backdrop-blur-xl backdrop-saturate-150 md:w-fit md:gap-2 md:rounded-[20px]">
                {/* Сортировка */}
                <div className="bg-card h-12 w-12 animate-pulse rounded-lg md:w-36 md:rounded-[16px]" />
                {/* Поиск */}
                <div className="bg-card h-12 flex-1 animate-pulse rounded-lg md:w-64 md:rounded-[16px]" />
                {/* Категории */}
                <div className="bg-card h-12 w-12 animate-pulse rounded-lg md:w-32 md:rounded-[16px]" />
              </div>
            </div>

            {/* Сетка товаров */}
            <div className="mt-4 flex flex-col items-center gap-12 pb-20">
              <div
                className={cn(
                  "grid w-full grid-cols-1 gap-2",
                  "md:grid-cols-2 lg:grid-cols-3",
                )}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <DiscountCardSkeleton key={i} />
                ))}
              </div>
              {/* Пагинация */}
              <div className="bg-card h-10 w-64 animate-pulse rounded-xl" />
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
