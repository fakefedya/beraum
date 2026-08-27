import { notFound } from "next/navigation";
import { getProducts } from "@/src/server/queries/products";
import { CatalogGrid } from "./_components/CatalogGrid";
import { CatalogSidebar } from "./_components/CatalogSidebar";
import { Section } from "@/src/components/shared/Section";
import { Container } from "@/src/components/shared/Container";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { CatalogPagination } from "./_components/CatalogPagination";
import { cn } from "@/src/lib/utils";
import { Metadata } from "next";
import { getCategoriesList } from "@/src/server/queries/categories";

const LIMIT = 12;

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;

  const categoriesRes = await getCategoriesList();
  const matchedCategory = categoriesRes.data?.find((c) => c.slug === category);

  if (!matchedCategory) {
    return { title: "Каталог" };
  }

  return {
    title: matchedCategory.name,
    description: `Купить ${matchedCategory.name.toLowerCase()} Beraum. Широкий ассортимент, выгодные цены, официальная гарантия.`,
    alternates: {
      canonical: `/catalog/${category}`,
    },
  };
}

export default async function Category({ params, searchParams }: PageProps) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;

  // 🛡️ SECURITY & LOGIC: Парсим и валидируем страницу
  const pageStr = resolvedSearchParams.page;
  const pageNum = typeof pageStr === "string" ? parseInt(pageStr, 10) : 1;
  const currentPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
  const offset = (currentPage - 1) * LIMIT;

  const sort = resolvedSearchParams.sort as
    "newest" | "price_asc" | "price_desc";

  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams).filter(
      // Исключаем системные параметры из фильтров
      ([k, v]) => v !== undefined && k !== "sort" && k !== "page",
    ),
  ) as Record<string, string | string[]>;

  // 🚀 ARCHITECTURE FIX: Паттерн Limit + 1
  const response = await getProducts({
    categorySlug: category,
    limit: LIMIT + 1, // Просим 13, чтобы узнать, есть ли дальше товары
    offset,
    sort,
    filters,
  });

  const rawData = response.data || [];
  const hasMore = rawData.length > LIMIT;
  const products = rawData.slice(0, LIMIT); // Отдаем UI только 12 штук

  const categoryTitle = products[0]?.categoryTitle || "Каталог";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог" },
    { label: categoryTitle },
  ];

  if (!response.success && response.code === "CATEGORY_NOT_FOUND") {
    notFound();
  }

  return (
    <div className="flex flex-col gap-10">
      <Section>
        <Container className="pt-32">
          <Breadcrumbs
            items={breadcrumbItems}
            className="flex justify-center"
          />
        </Container>
      </Section>
      <Section>
        <Container className="gap-5">
          <div className="flex flex-col gap-6">
            <CatalogSidebar categorySlug={category} />
            <div className="w-full">
              {!response.success || products.length === 0 ? (
                <EmptyState
                  title="Товары не найдены"
                  description="Попробуйте изменить параметры фильтрации."
                />
              ) : (
                <div className="flex w-full flex-col items-center gap-12">
                  <CatalogGrid products={products} />
                  <CatalogPagination
                    currentPage={currentPage}
                    hasMore={hasMore}
                  />
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
