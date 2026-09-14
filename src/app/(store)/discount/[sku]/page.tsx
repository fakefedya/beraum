import { notFound } from "next/navigation";
import { Metadata } from "next";
import { z } from "zod";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { getDiscountItemBySku } from "@/src/server/queries/discount";
import { ProductGallery } from "../../product/[article]/_components/ProductGallery";
import { SimilarProducts } from "../../product/[article]/_components/SimilarProducts";
import { DiscountItemInfo } from "./_components/DiscountItemInfo";
import { buildImageUrl, cn } from "@/src/lib/utils";

type PageProps = {
  params: Promise<{ sku: string }>;
};

const skuSchema = z
  .string()
  .min(5)
  .regex(/^[A-Za-z0-9\-]+$/);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const sku = decodeURIComponent(resolvedParams.sku);

  if (!skuSchema.safeParse(sku).success) return {};

  const { data: item } = await getDiscountItemBySku(sku);
  if (!item) return {};

  return {
    title: `Уценка: ${item.siteArticle} (${item.uniqueSku})`,
    description: `Оригинальная техника Beraum со скидкой. Уникальный SKU: ${item.uniqueSku}. ${item.defectDescription.substring(0, 100)}...`,
  };
}

export default async function DiscountProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const sku = decodeURIComponent(resolvedParams.sku);

  if (!skuSchema.safeParse(sku).success) notFound();

  const { data: item } = await getDiscountItemBySku(sku);

  if (!item) notFound();

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Дисконт", href: "/discount" },
    { label: "Каталог", href: "/discount/catalog" },
    { label: item.uniqueSku },
  ];

  const galleryImages = item.mediaKeys
    .sort((a, b) => (a.isCover === b.isCover ? 0 : a.isCover ? -1 : 1))
    .map((media) => ({
      url: buildImageUrl(
        { bucketName: "discount-products", fileKey: media.key },
        "discount-products",
      ),
      fit: media.fit,
    }));

  return (
    <div className={cn("flex flex-col gap-20", "md:gap-30")}>
      <Section className={cn("pt-24", "md:pt-32")}>
        <Container maxWidth="7xl">
          <div
            className={cn(
              "grid grid-cols-1 gap-12 lg:grid-cols-12",
              "lg:items-start lg:gap-16",
            )}
          >
            {/* Галерея (переиспользуем из основного каталога) */}
            <div
              className={cn(
                "relative z-10 aspect-2/3 w-full",
                "lg:aspect-auto",
                "lg:sticky lg:top-32 lg:h-[calc(100vh-140px)] lg:min-h-125",
                "lg:col-span-8",
              )}
            >
              <ProductGallery
                images={galleryImages}
                breadcrumbs={breadcrumbItems}
              />
            </div>

            {/* Инфо блок */}
            <div className={cn("ml-auto w-full max-w-full", "lg:col-span-4")}>
              <DiscountItemInfo item={item} />
            </div>
          </div>
        </Container>
      </Section>

      {item.categoryId && (
        <SimilarProducts
          categoryId={item.categoryId}
          excludeSiteArticle={item.siteArticle}
        />
      )}
    </div>
  );
}
