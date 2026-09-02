import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getProductByArticle,
  getPublishedArticles,
} from "@/src/server/queries/products";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { ProductGallery } from "./_components/ProductGallery";
import { ProductInfo } from "./_components/ProductInfo";
import {
  Breadcrumbs,
  BreadcrumbType,
} from "@/src/components/shared/Breadcrumbs";
import { cn } from "@/src/lib/utils";
import { Metadata } from "next";
import {
  SimilarProducts,
  SimilarProductsSkeleton,
} from "./_components/SimilarProducts";

const DOC_META: Record<string, { label: string }> = {
  user_instruction: { label: "Руководство пользователя" },
  service_instruction: { label: "Инструкция по установке" },
  certificate: { label: "Сертификат соответствия" },
};

interface PageProps {
  params: Promise<{ article: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((article) => ({ article: article.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { article } = await params;
  const res = await getProductByArticle(article);

  if (!res.success || !res.data) {
    return { title: "Товар не найден" };
  }

  const p = res.data;
  const title = `${p.productType} ${p.siteArticle}${p.colorName ? `, ${p.colorName}` : ""}`;
  const description = `${title}. Выгодная цена. Гарантия от производителя. Купить на Ozon, Wildberries, Яндекс Маркете.`;
  const ogImage = p.images.length > 0 ? p.images[0].url : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${p.itemArticle.toLowerCase()}`,
    },
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { article } = await params;
  const response = await getProductByArticle(article);

  if (!response.success || !response.data) {
    notFound();
  }

  const product = response.data;
  const breadcrumbItems: BreadcrumbType[] = [{ label: "Главная", href: "/" }];

  if (product.categoryTitle && product.categorySlug) {
    breadcrumbItems.push({
      label: product.categoryTitle,
      href: `/catalog/${product.categorySlug}`,
    });
  }

  breadcrumbItems.push({ label: product.siteArticle || "Артикул" });

  const totalStock = (product.ozonStockFbo ?? 0) + (product.fbsStock ?? 0);
  const title = `${product.productType} ${product.siteArticle}${product.colorName ? `, ${product.colorName}` : ""}`;

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    sku: product.itemArticle,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "RUB",
      availability:
        totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  const safeJsonLd = JSON.stringify(jsonLdData).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd }}
      />

      <div className={cn("flex flex-col gap-20", "md:gap-30")}>
        <Section>
          <Container className="pt-32" maxWidth="7xl">
            <div className="mb-4 block lg:hidden">
              <Breadcrumbs
                items={breadcrumbItems}
                className="flex justify-center"
              />
            </div>

            <div
              className={cn(
                "grid grid-cols-1 gap-12 lg:grid-cols-12",
                "lg:items-start lg:gap-16",
              )}
            >
              <div
                className={cn(
                  "relative z-10 aspect-2/3 w-full rounded-4xl",
                  "lg:aspect-auto",
                  "lg:sticky lg:top-32 lg:h-[calc(100vh-140px)] lg:min-h-125",
                  "lg:col-span-8",
                )}
              >
                <ProductGallery
                  breadcrumbs={breadcrumbItems}
                  images={product.images}
                />
              </div>

              <div className={cn("ml-auto w-full max-w-full", "lg:col-span-4")}>
                <ProductInfo product={product} />
              </div>
            </div>
          </Container>
        </Section>

        {product.documents && product.documents.length > 0 && (
          <Section>
            <Container>
              <div className="flex flex-col items-center justify-center gap-10">
                <h2 className="text-3xl font-medium">Документация</h2>
                <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
                  {product.documents.map((doc, idx) => {
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
                        <span className="text-sm font-medium">
                          {meta.label}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </Container>
          </Section>
        )}

        {product.categoryId && (
          <Suspense fallback={<SimilarProductsSkeleton />}>
            <SimilarProducts
              categoryId={product.categoryId}
              excludeSiteArticle={product.siteArticle}
            />
          </Suspense>
        )}
      </div>
    </>
  );
}
