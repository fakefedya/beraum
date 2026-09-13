import { Metadata } from "next";
import { getCategoriesList } from "@/src/server/queries/categories";
import { DiscountItemsTableWrapper } from "./_components/DiscountItemsTableWrapper";
import { CreateDiscountItemSheet } from "./_components/CreateDiscountItemSheet";

export const metadata: Metadata = {
  title: "Уцененные товары | Beraum Dashboard",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DiscountItemsPage({ searchParams }: PageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { data: categories } = await getCategoriesList();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Уцененные товары</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Управление физическими экземплярами дисконт-техники
          </p>
        </div>
        <CreateDiscountItemSheet categories={categories || []} />
      </div>

      <DiscountItemsTableWrapper page={currentPage} />
    </div>
  );
}
