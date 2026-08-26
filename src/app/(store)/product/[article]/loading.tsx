import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { cn } from "@/src/lib/utils";

export default function ProductLoading() {
  return (
    <Section className={cn("pt-24", "md:pt-32")}>
      <Container maxWidth="7xl">
        <div
          className={cn(
            "grid grid-cols-1 gap-12 lg:grid-cols-12",
            "lg:items-start lg:gap-16",
          )}
        >
          {/* Левая колонка: ProductGallery (1:1) */}
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

          {/* Правая колонка: ProductInfo (1:1) */}
          <div className={cn("ml-auto w-full max-w-full", "lg:col-span-4")}>
            {/* Блок 1: Заголовок и Бэйджи */}
            <div className="flex flex-col gap-6">
              <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
              <div className="flex flex-col gap-2">
                <div className="bg-muted h-6 w-32 animate-pulse rounded-sm" />
                <div className="bg-muted h-10 w-3/4 animate-pulse rounded-sm lg:h-12" />
                <div className="bg-muted h-4 w-24 animate-pulse rounded-sm" />
              </div>

              {/* Цена и статус */}
              <div className="mt-4 flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <div className="bg-muted h-8 w-40 animate-pulse rounded-sm" />
                  <div className="bg-muted h-5 w-28 animate-pulse rounded-sm" />
                </div>
                {/* Инфо-плашка о маркетплейсах */}
                <div className="bg-card h-24 w-full animate-pulse rounded-xl" />
              </div>
            </div>

            {/* Блок 2: Цвета */}
            <div className="flex flex-col gap-6">
              <div className="bg-muted h-6 w-48 animate-pulse rounded-sm" />
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted h-8 w-8 shrink-0 animate-pulse rounded-full md:h-6.5 md:w-6.5"
                  />
                ))}
              </div>
            </div>

            {/* Блок 3: Маркетплейсы */}
            <div className="flex flex-col gap-6">
              <div className="bg-muted h-6 w-48 animate-pulse rounded-sm" />
              <div className="grid grid-cols-1 gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="border-ring/60 flex animate-pulse items-center justify-between gap-4 rounded-xl border bg-transparent p-5"
                  >
                    <div className="flex w-full flex-col gap-2">
                      <div className="bg-muted h-6 w-32 rounded-sm" />
                      <div className="bg-muted h-4 w-48 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
