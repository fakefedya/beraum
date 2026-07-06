import { notFound } from "next/navigation";
import { getProducts } from "@/src/server/actions/catalog";
import { CatalogGrid } from "./_components/CatalogGrid";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { EmptyState } from "@/src/components/ui/empty-state";

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  const response = await getProducts({
    categorySlug: category,
    limit: 12,
    offset: 0,
  });

  if (!response.success) {
    if (response.error === "Категория не найдена") {
      notFound();
    }
    return (
      <EmptyState
        title="Каталог обновляется"
        description="Скоро здесь появятся новые предложения."
      />
    );
  }

  return (
    <Section>
      <Container className="pt-30">
        <div className="mb-10 flex flex-col gap-4">
          <h1 className="text-3xl font-medium tracking-tight">
            {response.data[0]?.categoryTitle || "Каталог"}
          </h1>
        </div>
        <CatalogGrid initialData={response.data} categorySlug={category} />
      </Container>
    </Section>
  );
}
