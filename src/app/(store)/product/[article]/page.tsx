import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductByArticle } from "@/src/server/actions/products.queries";
import { Container } from "@/src/components/layout/Container";
import { Section } from "@/src/components/layout/Section";
import { COLOR_SWATCH_MAP, DEFAULT_SWATCH_COLOR } from "@/src/lib/constants";
import { Icons } from "@/src/components/ui/icons";
import { ProductGallery } from "./_components/ProductGallery";
import { Badge } from "@/src/components/ui/badge";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";

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

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог" },
    { label: product.itemArticle },
  ];

  return (
    <Section>
      <Container className="pt-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          <div className="sticky top-24 z-10 h-[calc(100vh-96px)] max-h-300 min-h-100 w-full lg:col-span-2">
            <ProductGallery />
          </div>

          <div className="bg-card flex flex-col gap-8 rounded-lg p-4 lg:col-span-1">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                {product.isLatest && <Badge>Новинка</Badge>}
                <span className="text-black-muted text-sm">
                  Арт: {product.itemArticle}
                </span>
              </div>
              <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
                {product.categoryTitle} {product.siteArticle}
              </h1>

              <div className="mt-2 text-3xl font-semibold">
                {product.price > 0
                  ? `${product.price.toLocaleString("ru-RU")} ₽`
                  : "По запросу"}
              </div>
            </div>

            {/* Выбор цвета */}
            {product.variants.length > 1 && (
              <div className="flex flex-col gap-3 border-y border-black/5 py-6">
                <span className="text-sm font-medium">
                  Цвет:{" "}
                  <span className="text-black-muted">
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
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.30),0_0_0_1px_rgba(0,0,0,0.05)] transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                          isActive ? "ring-2 ring-black ring-offset-2" : ""
                        }`}
                        style={{ backgroundColor: hexColor }}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {/* Индикатор отсутствия стока (диагональная линия) */}
                        {!hasStock && (
                          <span className="absolute block h-10 w-[1px] -rotate-45 bg-red-500/50" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Маркетплейсы */}
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
                        className="group hover:shadow-card-hover flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-black"
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

            {/* Характеристики */}
            {validSpecs.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                <h3 className="text-xl font-medium">Характеристики</h3>
                <dl className="flex flex-col text-sm">
                  {validSpecs.map(([key, value], idx) => (
                    <div
                      key={key}
                      className={`flex justify-between py-3 ${
                        idx !== validSpecs.length - 1
                          ? "border-b border-black/5"
                          : ""
                      }`}
                    >
                      <dt className="text-black-muted w-1/2 pr-4">{key}</dt>
                      <dd className="w-1/2 text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
