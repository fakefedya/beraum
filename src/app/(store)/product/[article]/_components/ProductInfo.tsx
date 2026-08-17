import Link from "next/link";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import {
  COLOR_SWATCH_MAP,
  DEFAULT_SWATCH_COLOR,
  MARKETPLACE_LINKS,
} from "@/src/lib/constants";
import { cn } from "@/src/lib/utils";
import { getProductByArticle } from "@/src/server/actions/products.queries";

type ProductDetails = NonNullable<
  Awaited<ReturnType<typeof getProductByArticle>>["data"]
>;

interface ProductInfoProps {
  product: ProductDetails;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const totalStock = (product.ozonStockFbo ?? 0) + (product.fbsStock ?? 0);

  let StockStatusUI = null;

  if (totalStock > 0) {
    StockStatusUI = (
      <div className="text-foreground flex items-center gap-1.5 text-sm font-medium">
        <CheckCircle2
          className="text-brand-secondary size-5"

          aria-hidden="true"
        />
        <span>
          В наличии{" "}
          {totalStock < 10 && (
            <span className="text-muted-foreground ml-1 font-normal">
              (осталось мало)
            </span>
          )}
        </span>
      </div>
    );
  } else {
    StockStatusUI = (
      <div className="text-destructive flex items-center gap-1.5 text-sm font-medium">
        <XCircle className="size-5" strokeWidth={2} aria-hidden="true" />
        <span>Доступно под заказ</span>
      </div>
    );
  }

  const productLinks: Record<string, string | null> = {
    ozon: product.ozonLink,
    wb: product.wbLink,
    ymarket: product.ymarketLink,
    mvideo: product.mvideoLink,
  };

  const getStockForMp = (id: string) => {
    if (id === "ozon") return product.ozonStockFbo ?? 0;
    if (id === "wb" || id === "ymarket" || id === "mvideo")
      return product.fbsStock ?? 0;
    return 0;
  };

  const activeMarketplaces = MARKETPLACE_LINKS.store
    .map((mp) => ({
      ...mp,
      link: productLinks[mp.id],
      stock: getStockForMp(mp.id),
    }))
    .filter((mp) => mp.link && mp.stock > 0);

  const validSpecs = Object.entries(product.specifications || {}).filter(
    ([_, val]) => val !== null && val !== "",
  );

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-6">
        {product.isLatest && (
          <Badge className="bg-brand text-foreground text-xs leading-normal font-medium uppercase">
            Новинка
          </Badge>
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-lg text-balance">
            {product.productType}
          </span>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight uppercase lg:text-4xl">
            {product.siteArticle}
          </h1>
          <span className="text-muted-foreground text-sm">
            Арт. {product.itemArticle}
          </span>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {product.price > 0 ? (
              <div className="text-foreground text-3xl font-medium">
                {product.price.toLocaleString("ru-RU")} ₽
              </div>
            ) : (
              <div className="text-muted-foreground text-2xl font-medium">
                По запросу
              </div>
            )}

            {StockStatusUI}
          </div>

          {product.price > 0 && (
            <div className="bg-card flex items-start gap-3 rounded-xl p-4">
              <Info
                className="text-muted-foreground mt-0.5 size-5 shrink-0"
                strokeWidth={2}
              />
              <p className="text-muted-foreground text-sm leading-relaxed">
                Размер предоставляемой скидки, условия оплаты частями и
                финальная стоимость формируются на стороне выбранного
                маркетплейса при оформлении заказа.
              </p>
            </div>
          )}
        </div>
      </div>

      {product.variants.length > 0 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-medium text-balance">
            <span className="text-foreground">Цвет.</span>{" "}
            <span className="text-muted-foreground/60">
              Выберите подходящий.
            </span>
          </h2>

          <div className="flex flex-wrap gap-3">
            {product.variants.map((variant) => {
              const isActive = variant.itemArticle === product.itemArticle;
              const hexColor = variant.colorName
                ? COLOR_SWATCH_MAP[variant.colorName] || DEFAULT_SWATCH_COLOR
                : DEFAULT_SWATCH_COLOR;
              const hasVariantStock =
                (variant.ozonStockFbo ?? 0) +
                  (variant.fbsStock ?? 0) +
                  (variant.manualStock ?? 0) >
                0;

              return (
                <Link
                  key={variant.id}
                  href={`/product/${variant.itemArticle.toLowerCase()}`}
                  title={variant.colorName || "Стандарт"}
                  className={cn(
                    "relative flex h-6.5 w-6.5 items-center justify-center rounded-full shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.30),0_0_0_1px_rgba(0,0,0,0.05)]",
                    "transition-all duration-300",
                    isActive && product.variants.length > 1
                      ? "ring-brand-secondary scale-106 ring-2 ring-offset-2"
                      : "border-black/10 hover:border-black/30",
                  )}
                  style={{ backgroundColor: hexColor }}
                  aria-current={isActive ? "page" : undefined}
                >
                  {!hasVariantStock && (
                    <span className="absolute block h-9 w-px -rotate-45 bg-red-500/80" />
                  )}
                </Link>
              );
            })}
          </div>
          <span className="text-foreground mt-1 text-sm font-medium">
            Цвет:{" "}
            <span className="text-muted-foreground ml-1 font-normal">
              {product.colorName || "Стандартный"}
            </span>
          </span>
        </div>
      )}

      {activeMarketplaces.length > 0 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-medium text-balance">
            <span className="text-foreground">Заказ.</span>{" "}
            <span className="text-muted-foreground/60">Где вам удобнее?</span>
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {activeMarketplaces.map((mp) => {
              const redirectUrl = `/api/go?marketplace=${mp.id}&article=${product.itemArticle}&url=${encodeURIComponent(mp.link as string)}`;
              const Icon = mp.icon;
              return (
                <a
                  key={mp.id}
                  href={redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group flex items-center justify-between gap-4 rounded-xl p-5",
                    "border-ring/60 border bg-transparent",
                    "hover:border-muted-foreground cursor-pointer transition-all duration-300",
                  )}
                >
                  <div className="flex flex-col items-start gap-4 overflow-hidden">
                    <Icon className="size-10 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-foreground text-base font-semibold tracking-tight transition-colors">
                        {mp.label}
                      </span>
                      {mp.promoText && (
                        <span className="text-muted-foreground flex flex-wrap text-sm">
                          {mp.promoText}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col text-right">
                    <span className="text-foreground text-sm font-medium">
                      {mp.stock < 10 ? `Мало (${mp.stock})` : "В наличии"}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {validSpecs.length > 0 && (
        <div className="mt-2 flex flex-col gap-6">
          <h2 className="text-xl font-medium text-balance">
            <span className="text-foreground">Характеристики.</span>{" "}
            <span className="text-muted-foreground/60">Самое важное.</span>
          </h2>
          <dl className="flex flex-col text-sm">
            {validSpecs.map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col gap-1 border-b border-black/5 py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-4 dark:border-white/10"
              >
                <dt className="text-muted-foreground leading-relaxed sm:w-1/2">
                  {key}
                </dt>
                <dd className="text-foreground leading-relaxed font-medium sm:w-1/2 sm:text-right">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};
