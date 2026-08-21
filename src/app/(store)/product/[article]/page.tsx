import { notFound } from "next/navigation";
import {
  getProductByArticle,
  getSimilarProducts,
} from "@/src/server/actions/products.queries";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { ProductGallery } from "./_components/ProductGallery";
import { ProductInfo } from "./_components/ProductInfo";
import { ProductCard } from "@/src/components/shared/ProductCard";
import {
  Breadcrumbs,
  BreadcrumbType,
} from "@/src/components/shared/Breadcrumbs";
import { cn } from "@/src/lib/utils";

const DOC_META: Record<string, { label: string }> = {
  user_instruction: { label: "Руководство пользователя" },
  service_instruction: { label: "Инструкция по установке" },
  certificate: { label: "Сертификат соответствия" },
};

interface PageProps {
  params: Promise<{ article: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { article } = await params;
  const response = await getProductByArticle(article);

  if (!response.success || !response.data) {
    notFound();
  }

  const product = response.data;
  const similarProducts = product.categoryId
    ? (await getSimilarProducts(product.categoryId, product.siteArticle, 3))
        .data
    : [];

  const breadcrumbItems: BreadcrumbType[] = [{ label: "Главная", href: "/" }];

  if (product.categoryTitle && product.categorySlug) {
    breadcrumbItems.push({
      label: product.categoryTitle,
      href: `/catalog/${product.categorySlug}`,
    });
  }

  breadcrumbItems.push({ label: product.siteArticle || "Артикул" });

  return (
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
              <div className="flex flex-wrap justify-center gap-4">
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
                      <span className="text-sm font-medium">{meta.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </Container>
        </Section>
      )}
      <Section>
        <Container>
          {similarProducts && similarProducts.length > 0 && (
            <div className="flex flex-col items-center gap-10">
              <h2 className="text-3xl font-medium">Вам может понравиться</h2>
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {similarProducts.map((p) => (
                  <ProductCard key={p.siteArticle} product={p} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
