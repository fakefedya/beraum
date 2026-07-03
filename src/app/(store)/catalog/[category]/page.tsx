import { notFound } from "next/navigation";
import { getProducts } from "@/src/server/actions/catalog";
import { CatalogGrid } from "./_components/CatalogGrid";

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
      <div className="flex min-h-[50vh] items-center justify-center text-red-500">
        Ошибка: {response.error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight uppercase">
          {response.data[0]?.categoryTitle || "Каталог"}
        </h1>
        <p className="text-black-muted max-w-2xl">
          Здесь мы выведем SEO-описание для категории или оставим просто
          заголовок.
        </p>
      </div>

      <CatalogGrid initialData={response.data} categorySlug={category} />
    </div>
  );
}
