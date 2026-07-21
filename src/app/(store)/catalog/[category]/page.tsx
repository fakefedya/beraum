// src/app/(store)/catalog/[category]/page.tsx
import { notFound } from "next/navigation";
import { getProducts } from "@/src/server/actions/products.queries";
import { CatalogGrid } from "./_components/CatalogGrid";
import { CatalogSidebar } from "./_components/CatalogSidebar";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { cn } from "@/src/lib/utils";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = resolvedSearchParams.sort as
    | "newest"
    | "price_asc"
    | "price_desc";

  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams).filter(
      ([k, v]) => v !== undefined && k !== "sort",
    ),
  ) as Record<string, string | string[]>;

  const response = await getProducts({
    categorySlug: category,
    limit: 12,
    offset: 0,
    sort,
    filters,
  });

  const categoryTitle = response.data?.[0]?.categoryTitle || "Каталог";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог" },
    { label: categoryTitle },
  ];

  if (!response.success && response.error === "Категория не найдена") {
    notFound();
  }

  return (
    <Section>
      <Container className="gap-8 pt-40">
        <Breadcrumbs items={breadcrumbItems} />
        <div
          className={cn("flex flex-col gap-8", "xl:flex-row xl:items-start")}
        >
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
