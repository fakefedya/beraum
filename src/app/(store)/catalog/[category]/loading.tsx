import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";

// Локальный компонент карточки-скелетона (1:1 с ProductCard.tsx)
const ProductCardSkeleton = () => (
  <article className="bg-card relative rounded-4xl border-2 border-transparent px-4 pt-4 pb-6">
    <div className="relative flex flex-col gap-4">
      {/* Изображение */}
      <div className="bg-accent relative flex aspect-4/5 animate-pulse items-center justify-center overflow-hidden rounded-xl" />

      {/* Цвета (радио-кнопки) */}
      <div className="z-1 flex items-center justify-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted h-6 w-6 shrink-0 animate-pulse rounded-full md:h-4 md:w-4"
          />
        ))}
      </div>

      {/* Текст (Тип, Артикул, Цена) */}
      <div className="mt-4 flex flex-col gap-1">
        <div className="bg-muted h-4 w-1/2 animate-pulse rounded-sm" />
        <div className="bg-muted mt-1 h-5 w-3/4 animate-pulse rounded-sm" />
        <div className="bg-muted mt-7 h-6 w-1/3 animate-pulse rounded-sm" />
      </div>

      {/* Бэйджи под заказ / новинка */}
      <div className="absolute top-0 right-0 flex items-center gap-2">
        <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
      </div>
    </div>
  </article>
);

export default function CatalogLoading() {
  return (
    <div className="flex flex-col gap-10">
      <Section>
        <Container className="pt-32">
          {/* Breadcrumbs Skeleton */}
          <div className="flex justify-center">
            <div className="bg-muted h-5 w-48 animate-pulse rounded-md" />
          </div>
        </Container>
      </Section>
      <Section>
        <Container className="gap-5">
          <div className="flex flex-col gap-6">
            {/* Сайдбар Фильтров (1:1 с CatalogSidebar.tsx) */}
            <div className="sticky top-20 z-10 flex w-full justify-center md:top-24">
              <div className="bg-background/80 shadow-nav flex w-fit flex-wrap gap-2 rounded-xl p-1 backdrop-blur-xl backdrop-saturate-150 md:rounded-[20px] md:p-1.5">
                <div className="bg-card h-12 w-36 animate-pulse rounded-lg md:rounded-[16px]" />
                <div className="bg-card h-12 w-32 animate-pulse rounded-lg md:rounded-[16px]" />
              </div>
            </div>

            {/* Сетка товаров (1:1 с CatalogGrid.tsx) */}
            <div className="w-full">
              <div className="flex w-full flex-col items-center gap-12">
                <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
                {/* Пагинация Skeleton */}
                <div className="bg-card h-10 w-64 animate-pulse rounded-xl" />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
