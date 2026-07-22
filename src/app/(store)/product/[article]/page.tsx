import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductByArticle,
  getSimilarProducts,
} from "@/src/server/actions/products.queries";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { COLOR_SWATCH_MAP, DEFAULT_SWATCH_COLOR } from "@/src/lib/constants";
import { Icons } from "@/src/components/ui/icons";
import { ProductGallery } from "./_components/ProductGallery";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { FileText, Wrench, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/src/components/shared/ProductCard";

const DOC_META: Record<string, { label: string; icon: React.ElementType }> = {
  user_instruction: { label: "Инструкция по эксплуатации", icon: FileText },
  service_instruction: { label: "Сервисное руководство", icon: Wrench },
  certificate: { label: "Сертификат соответствия", icon: ShieldCheck },
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

  const ozonStock = product.ozonStockFbo || 0;
  const fbsStock = product.fbsStock || 0;

  const marketplaces = [
    {
      id: "ozon",
      link: product.ozonLink,
      stock: ozonStock,
      icon: Icons.ozon,
      label: "OZON",
    },
    {
      id: "wb",
      link: product.wbLink,
      stock: fbsStock,
      icon: Icons.wb,
      label: "Wildberries",
    },
    {
      id: "ymarket",
      link: product.ymarketLink,
      stock: fbsStock,
      icon: Icons.ym,
      label: "Яндекс Маркет",
    },
    {
      id: "mvideo",
      link: product.mvideoLink,
      stock: fbsStock,
      icon: Icons.mvideo,
      label: "М.Видео",
    },
  ].filter((mp) => mp.link && mp.stock > 0);

  const validSpecs = Object.entries(product.specifications || {}).filter(
    ([_, val]) => val !== null && val !== "",
  );

  return (
    <Section>
      <Container className="max-w-7xl pt-32 pb-16">
        <div
          className={cn(
            "grid grid-cols-1 gap-6 lg:grid-cols-12",
            "lg:items-start",
          )}
        >
          <div
            className={cn(
              "sticky top-32 z-10 h-[calc(100vh-140px)] min-h-125 w-full",
              "lg:col-span-8",
            )}
          >
            <ProductGallery />
          </div>

          <div
            className={cn(
              "bg-background shadow-card flex flex-col gap-8 rounded-[24px] p-6 lg:col-span-4",
              "lg:p-8",
            )}
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                {product.isLatest && (
                  <Badge className="bg-brand text-foreground text-xs font-medium uppercase">
                    Новинка
                  </Badge>
                )}
                <h1
                  className={cn(
                    "text-2xl font-medium tracking-tight",
                    "xl:text-3xl",
                  )}
                >
                  {product.productType} {""}
                  <span className="whitespace-nowrap">
                    {product.siteArticle}
                  </span>
                </h1>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  Артикул:{" "}
                  <span className="text-foreground bg-card rounded-sm p-1 font-medium">
                    {product.itemArticle}
                  </span>
                </div>
              </div>

              {product.price > 0 ? (
                <div className="flex flex-col gap-1">
                  <span className="bg-brand w-fit rounded-lg p-1 text-2xl font-medium">
                    от {product.price.toLocaleString("ru-RU")} ₽
                  </span>
                  <span className="text-muted-foreground mt-1 text-sm">
                    или {Math.ceil(product.price / 6).toLocaleString("ru-RU")} ₽
                    x 6 месяцев
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-semibold">По запросу</span>
              )}
            </div>

            {product.variants.length > 0 && (
              <div className="flex flex-col gap-4 border-y border-black/5 py-6">
                <span className="text-sm font-medium">
                  Цвет:
                  <span className="text-muted-foreground">
                    {product.colorName || "Стандартный"}
                  </span>
                </span>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => {
                    const isActive =
                      variant.itemArticle === product.itemArticle;
                    const hexColor = variant.colorName
                      ? COLOR_SWATCH_MAP[variant.colorName] ||
                        DEFAULT_SWATCH_COLOR
                      : DEFAULT_SWATCH_COLOR;

                    const hasStock =
                      (variant.ozonStockFbo || 0) +
                        (variant.fbsStock || 0) +
                        (variant.manualStock || 0) >
                      0;

                    return (
                      <Link
                        key={variant.id}
                        href={`/product/${variant.itemArticle.toLowerCase()}`}
                        title={variant.colorName || "Стандарт"}
                        className={cn(
                          "relative flex h-9 w-9 items-center justify-center rounded-full shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.30),0_0_0_1px_rgba(0,0,0,0.05)] transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                          isActive && "ring-2 ring-black ring-offset-2",
                        )}
                        style={{ backgroundColor: hexColor }}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {!hasStock && (
                          <span className="absolute block h-10 w-px -rotate-45 bg-red-500/50" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {marketplaces.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="text-sm font-medium">Где купить:</span>
                <div className="grid grid-cols-2 gap-3">
                  {marketplaces.map((mp) => {
                    const Icon = mp.icon;
                    return (
                      <a
                        key={mp.id}
                        href={mp.link as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "bg-background hover:shadow-card-hover group flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl p-4 shadow-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-black",
                          "sm:aspect-square",
                        )}
                      >
                        <Icon className="h-10 w-10 transition-transform group-hover:scale-110" />
                        <span className="text-center text-xs font-medium">
                          {mp.label}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {validSpecs.length > 0 && (
              <div className="mt-2 flex flex-col gap-4">
                <h3 className="text-lg font-medium">Характеристики</h3>
                <dl className="flex flex-col text-sm">
                  {validSpecs.map(([key, value], idx) => (
                    <div
                      key={key}
                      className={cn(
                        "flex justify-between py-3",
                        idx !== validSpecs.length - 1 &&
                          "border-b border-black/5",
                      )}
                    >
                      <dt className="text-muted-foreground w-1/2 pr-4">
                        {key}
                      </dt>
                      <dd className="w-1/2 text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
        {/* Заглушка */}
        {product.documents && product.documents.length >= 0 && (
          <div className="mt-24 flex flex-col items-center justify-center gap-8">
            <h2 className="text-2xl font-medium tracking-tight xl:text-3xl">
              Документация
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {product.documents.map((doc, idx) => {
                const meta = DOC_META[doc.type];
                if (!meta) return null;
                const Icon = meta.icon;

                return (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "bg-card hover:shadow-card-hover group flex w-full items-center gap-4 rounded-2xl p-4 transition-all duration-300 sm:w-auto md:min-w-64",
                      "outline-none focus-visible:ring-2 focus-visible:ring-black",
                    )}
                  >
                    <div className="bg-background flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110">
                      <Icon className="text-muted-foreground h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{meta.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
        {/* Вам может понравиться */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="mt-24 flex flex-col items-center gap-8">
            <h2 className="text-2xl font-medium tracking-tight xl:text-3xl">
              Вам может понравиться
            </h2>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {similarProducts.map((p) => (
                <ProductCard key={p.siteArticle} product={p} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
