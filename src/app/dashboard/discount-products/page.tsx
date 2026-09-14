import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { getCategoriesList } from "@/src/server/queries/categories";
import { DiscountItemsTableWrapper } from "./_components/DiscountItemsTableWrapper";
import { CreateDiscountItemSheet } from "./_components/CreateDiscountItemSheet";
import { SearchInput } from "@/src/components/shared/SearchInput";
import { requireAuthRole } from "@/src/server/utils/auth-check";

export const metadata: Metadata = {
  title: "Уцененные товары",
};

const searchParamsSchema = z.object({
  page: z.coerce.number().min(1).catch(1),
  q: z.string().trim().catch(""),
});

export default async function DiscountItemsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    await requireAuthRole(["superadmin", "admin", "manager"]);
  } catch {
    redirect("/dashboard");
  }

  const rawParams = await props.searchParams;
  const { page: currentPage, q: query } = searchParamsSchema.parse(rawParams);

  const { data: categories } = await getCategoriesList();

  const suspenseKey = `${query}-${currentPage}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Уцененные товары
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Управление физическими экземплярами дисконт-техники
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            paramName="q"
            placeholder="Поиск по SKU или описанию..."
          />
          <CreateDiscountItemSheet categories={categories || []} />
        </div>
      </div>

      <Suspense
        key={suspenseKey}
        fallback={
          <div className="bg-card flex h-64 w-full items-center justify-center rounded-xl border">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        }
      >
        <DiscountItemsTableWrapper page={currentPage} query={query} />
      </Suspense>
    </div>
  );
}
