import { Suspense } from "react";
import { Metadata } from "next";
import { z } from "zod";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import {
  getPublicDiscountItems,
  getDiscountCategories,
} from "@/src/server/queries/discount";
import { DiscountGrid } from "./_components/DiscountGrid";
import { DiscountSidebar } from "./_components/DiscountSidebar";
import { CatalogPagination } from "../../catalog/[category]/_components/CatalogPagination";
import { cn } from "@/src/lib/utils";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Каталог уцененной техники — Beraum",
  description:
    "Оригинальная техника Beraum со скидками. Исправные товары с незначительными внешними дефектами.",
};

const searchParamsSchema = z.object({
  page: z.coerce.number().min(1).catch(1),
  category: z.string().uuid().or(z.literal("all")).catch("all"),
  sort: z.enum(["newest", "price_asc", "price_desc"]).catch("newest"),
});

export default async function DiscountCatalogPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawParams = await props.searchParams;
  const { page, category, sort } = searchParamsSchema.parse(rawParams);
  const limit = 12;
  const offset = (page - 1) * limit;

  const [categoriesRes, itemsRes] = await Promise.all([
    getDiscountCategories(),
    getPublicDiscountItems({ categoryId: category, limit, offset, sort }),
  ]);

  const breadcrumbItems = [
    { label: "Дисконт", href: "/discount" },
    { label: "Каталог дисконта" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <Section>
        <Container className={cn("pt-24", "md:pt-32")}>
          <Breadcrumbs
            items={breadcrumbItems}
            className="flex justify-center"
          />
        </Container>
      </Section>

      <Section>
        <Container maxWidth="7xl" className="gap-5">
          <div className="flex flex-col gap-6">
            {categoriesRes.success && categoriesRes.data.length > 0 && (
              <DiscountSidebar
                categories={categoriesRes.data}
                currentCategory={category}
                currentSort={sort}
              />
            )}
          </div>

          <Suspense
            key={`${category}-${sort}-${page}`}
            fallback={
              <div className="bg-muted/20 mt-4 flex min-h-100 w-full items-center justify-center rounded-2xl border">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            }
          >
            <div className="mt-4 flex flex-col items-center gap-12 pb-20">
              <DiscountGrid products={itemsRes.data || []} />
              <CatalogPagination
                currentPage={page}
                hasMore={itemsRes.hasMore ?? false}
              />
            </div>
          </Suspense>
        </Container>
      </Section>
    </div>
  );
}
