// src/app/(store)/catalog/[category]/page.tsx
import { notFound } from "next/navigation";
import { getProducts } from "@/src/server/actions/products.queries";
import { CatalogGrid } from "./_components/CatalogGrid";
import { CatalogSidebar } from "./_components/CatalogSidebar";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { EmptyState } from "@/src/components/ui/empty-state";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  // Асинхронно распаковываем параметры URL
  const { category } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = resolvedSearchParams.sort as
    | "newest"
    | "price_asc"
    | "price_desc";

  // Очищаем undefined из searchParams перед передачей в Zod
  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams).filter(
      ([k, v]) => v !== undefined && k !== "sort",
    ),
  ) as Record<string, string | string[]>;

  // Делаем SSR запрос в БД с учетом фильтров
  const response = await getProducts({
    categorySlug: category,
    limit: 12,
    offset: 0,
    sort,
    filters, // <-- Передаем фильтры из URL в Action
  });

  if (!response.success && response.error === "Категория не найдена") {
    notFound();
  }

  return (
    <Section>
      <Container className="pt-30">
        {/* <div className="mb-10 flex flex-col gap-4">
          <h1 className="text-3xl font-medium tracking-tight">
            {response.data?.[0]?.categoryTitle || "Каталог"}
          </h1>
        </div> */}

        {/* Лейаут: Сайдбар слева, Сетка справа */}
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
          <CatalogSidebar categorySlug={category} />

          <div className="flex-1">
            {!response.success || response.data.length === 0 ? (
              <EmptyState
                title="Товары не найдены"
                description="Попробуйте изменить параметры фильтрации."
              />
            ) : (
              <CatalogGrid
                initialData={response.data}
                categorySlug={category}
              />
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
