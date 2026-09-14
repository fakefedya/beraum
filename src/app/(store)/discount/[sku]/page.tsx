import { notFound } from "next/navigation";
import { Metadata } from "next";
import { z } from "zod";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { getDiscountItemBySku } from "@/src/server/queries/discount";
import { ProductGallery } from "../../product/[article]/_components/ProductGallery";
import { SimilarProducts } from "../../product/[article]/_components/SimilarProducts";
import { DiscountItemInfo } from "./_components/DiscountItemInfo";
import { buildImageUrl, cn } from "@/src/lib/utils";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";

type PageProps = {
  params: Promise<{ sku: string }>;
};

const skuSchema = z
  .string()
  .min(5)
  .regex(/^[A-Za-z0-9\-]+$/);

const DOC_META: Record<string, { label: string }> = {
  user_instruction: { label: "Руководство пользователя" },
  service_instruction: { label: "Инструкция по установке" },
  certificate: { label: "Сертификат соответствия" },
};

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

      {/* ДОКУМЕНТЫ */}
      {item.documents && item.documents.length > 0 && (
        <Section>
          <Container>
            <div className="flex flex-col items-center justify-center gap-10">
              <h2 className="text-center text-3xl font-medium">Документация</h2>
              <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
                {item.documents.map((doc, idx) => {
                  const meta = DOC_META[doc.type];
                  if (!meta) return null;

                  return (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "bg-card border-border/50 flex flex-col gap-4 rounded-2xl border p-5",
                        "hover:border-foreground/30 transition-colors duration-300",
                        "focus-visible:ring-foreground outline-none focus-visible:ring-2",
                      )}
                    >
                      <span className="text-background w-fit rounded bg-[linear-gradient(to_right_bottom,#fe6455,#fd5b4c,#fa3d2f)] px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                        PDF
                      </span>
                      <span className="text-sm font-medium">{meta.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* ПОХОЖИЕ ТОВАРЫ */}
      {item.categoryId && (
        <SimilarProducts
          categoryId={item.categoryId}
          excludeSiteArticle={item.siteArticle}
        />
      )}
    </div>
  );
}
