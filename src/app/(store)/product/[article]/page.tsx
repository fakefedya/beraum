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
import { CheckCircle2, XCircle } from "lucide-react";
import { ProductCard } from "@/src/components/shared/ProductCard";
import { BreadcrumbType } from "@/src/components/shared/Breadcrumbs";

const DOC_META: Record<string, { label: string }> = {
  user_instruction: { label: "Руководство пользователя" },
  service_instruction: { label: "Инструкция по установке" },
  certificate: { label: "Сертификат соответствия" },
};

interface PageProps {
  params: Promise<{ article: string }>;
}

export default async function Product({ params }: PageProps) {
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

  let StockStatusUI: React.ReactNode = null;

  if (ozonStock > 0 && fbsStock > 0) {
    const minStock = Math.min(ozonStock, fbsStock);
    StockStatusUI =
      minStock < 10 ? (
        <>
          <CheckCircle2 className="size-5" aria-hidden="true" />
          <div>
            В наличии
            <span className="text-red-500"> — осталось {minStock} шт!</span>
          </div>
        </>
      ) : (
        <>
          <CheckCircle2 className="size-5" aria-hidden="true" />
          <span className="">В наличии</span>
        </>
      );
  } else if (ozonStock > 0 || fbsStock > 0) {
    const availableStock = Math.max(ozonStock, fbsStock);
    StockStatusUI =
      availableStock < 10 ? (
        <>
          <CheckCircle2 className="size-5" aria-hidden="true" />
          <div>
            В наличии
            <span className="text-red-500">
              {" "}
              — осталось {availableStock} шт!
            </span>
          </div>
        </>
      ) : (
        <>
          <CheckCircle2 className="size-5" aria-hidden="true" />
          <span className="">В наличии</span>
        </>
      );
  } else {
    StockStatusUI = (
      <>
        <XCircle className="text-destructive size-5" aria-hidden="true" />
        <span className="text-red-500">Товар доступен под заказ</span>
      </>
    );
  }

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

  const productArticle = product.siteArticle || "Артикул";
  const breadcrumbItems: BreadcrumbType[] = [{ label: "Главная", href: "/" }];

  if (product.categoryTitle && product.categorySlug) {
    breadcrumbItems.push({
      label: product.categoryTitle,
      href: `/catalog/${product.categorySlug}`,
    });
  }

  breadcrumbItems.push({ label: productArticle });

  return (
    <Section>
      <Container className="pt-32 pb-16">
        <div
          className={cn(
            "grid grid-cols-1 gap-6 lg:grid-cols-12",
            "lg:items-start",
          )}
        >
          <div
            className={cn(
              "sticky top-32 z-10 h-[calc(100vh-140px)] min-h-125 w-full",
              "lg:col-span-7",
            )}
          >
            <ProductGallery
              breadcrumbs={breadcrumbItems}
              images={product.images}
            />
          </div>

          <div
            className={cn(
              "bg-background shadow-card flex flex-col gap-8 rounded-[24px] p-6 lg:col-span-5",
              "lg:p-8",
            )}
          >
            <div className="flex flex-col gap-4">
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
                  <span className="text-foreground bg-card/80 rounded-sm p-1 font-medium">
                    {product.itemArticle}
                  </span>
                </div>
              </div>

              {product.price > 0 ? (
                <div className="flex flex-col gap-1">
                  <span className="bg-brand-secondary w-fit rounded-lg p-1 text-2xl font-medium">
                    от {product.price.toLocaleString("ru-RU")} ₽
                  </span>
                  <span className="text-muted-foreground text-sm">
                    или {Math.ceil(product.price / 6).toLocaleString("ru-RU")} ₽
                    x 6 месяцев
                  </span>
                  <div
                    className={cn(
                      "relative mt-2 w-full rounded-[12px] bg-[#e7ffbc] p-4 text-sm",
                      "after:absolute after:top-[-5.5px] after:left-4 after:h-4 after:w-4 after:rotate-45 after:bg-[#e7ffbc]",
                    )}
                  >
                    Размер предоставляемой скидки определяется условиями
                    маркетплейса и может отличаться от стоимости на данном сайте
                  </div>
                </div>
              ) : (
                <span className="text-2xl font-semibold">По запросу</span>
              )}

              <div className="bg-card/80 flex w-full items-center justify-center gap-4 rounded-[12px] p-4 text-sm font-medium">
                {StockStatusUI}
              </div>
            </div>
            {product.variants.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="text-muted-foreground text-sm">
                  Цвет:{" "}
                  <span className="text-foreground bg-card/80 rounded-sm p-1 font-medium">
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
                      (variant.ozonStockFbo || 0) + (variant.fbsStock || 0) > 0;

                    return (
                      <Link
                        key={variant.id}
                        href={`/product/${variant.itemArticle.toLowerCase()}`}
                        title={variant.colorName || "Стандарт"}
                        className={cn(
                          "relative flex h-9 w-9 items-center justify-center rounded-full shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.30),0_0_0_1px_rgba(0,0,0,0.05)]",
                          "cursor-auto focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                          "transition-transform",
                          product.variants.length > 1 &&
                            "cursor-pointer hover:scale-105",
                          isActive &&
                            product.variants.length > 1 &&
                            "ring-brand-secondary ring-2 ring-offset-2",
                        )}
                        style={{ backgroundColor: hexColor }}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {!hasStock && (
                          <span className="absolute block h-10 w-px -rotate-45 bg-red-500" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            {marketplaces.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="font-lg font-medium">Где купить</span>
                <div className="grid grid-cols-2 gap-2">
                  {marketplaces.map((mp) => {
                    const redirectUrl = `/api/go?marketplace=${mp.id}&article=${product.itemArticle}&url=${encodeURIComponent(mp.link as string)}`;
                    const Icon = mp.icon;
                    return (
                      <a
                        key={mp.id}
                        href={redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "bg-card group focus:hover-background/80 flex cursor-pointer items-center gap-4 rounded-lg border-2 border-transparent p-1.5",
                          "hover:border-brand transition-colors duration-300",
                        )}
                      >
                        <Icon className="size-12" />
                        <span className="text-base leading-none font-medium">
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
                <h3 className="font-medium">Характеристики</h3>
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

        {product.documents && product.documents.length > 0 && (
          <div className="mt-24 flex flex-col items-center justify-center gap-8">
            <h2 className="text-2xl font-medium tracking-tight xl:text-3xl">
              Документация
            </h2>
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
                      "bg-card flex flex-col gap-4 rounded-2xl border-2 border-transparent p-4",
                      "outline-none focus-visible:ring-2 focus-visible:ring-black",
                      "hover:border-brand transition-colors duration-300",
                    )}
                  >
                    <span className="text-background w-fit rounded-sm bg-[linear-gradient(to_right_bottom,#fe6455,#fd5b4c,#fc5242,#fb4839,#fa3d2f)] px-1.5 py-1 text-[10px] font-medium tracking-wider">
                      PDF
                    </span>
                    <span className="text-sm">{meta.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

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
