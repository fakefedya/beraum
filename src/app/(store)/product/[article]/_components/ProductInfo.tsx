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
    <div className="flex flex-col gap-8">
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
          <span className="text-muted-foreground mt-1 text-sm">
            Арт. {product.itemArticle}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5 pb-8">
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
          <div className="bg-card mt-2 flex items-start gap-3 rounded-2xl p-4">
            <Info
              className="text-muted-foreground mt-0.5 size-5 shrink-0"
              strokeWidth={2}
            />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Размер предоставляемой скидки, условия оплаты частями и финальная
              стоимость формируются на стороне выбранного маркетплейса при
              оформлении заказа
            </p>
          </div>
        )}
      </div>

      {product.variants.length > 0 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-medium text-balance">
            <span className="text-foreground">Цвет.</span>{" "}
            <span className="text-muted-foreground">Выберите подходящий.</span>
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
                    product.variants.length > 1 && "hover:scale-106",
                    isActive
                      ? "ring-brand-secondary ring-offset-background scale-106 ring-2 ring-offset-2"
                      : "opacity-80 hover:opacity-100",
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

      {/* --- 4. ГДЕ КУПИТЬ --- */}
      {activeMarketplaces.length > 0 && (
        <div className="flex flex-col gap-4 pt-6">
          <h2 className="text-xl font-medium text-balance">
            <span className="text-foreground font-semibold">Заказ.</span>{" "}
            <span className="text-muted-foreground font-medium">
              Где вам удобнее?
            </span>
          </h2>

          <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    "group flex items-center gap-4 rounded-2xl border border-black/10 bg-transparent p-4 dark:border-white/10",
                    "cursor-pointer transition-all duration-300 hover:border-black/30 hover:shadow-sm dark:hover:border-white/30",
                  )}
                >
                  <Icon className="size-8 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-foreground group-hover:text-brand-secondary-muted text-sm font-semibold tracking-tight transition-colors">
                      {mp.label}
                    </span>
                    <span className="text-muted-foreground mt-0.5 text-xs">
                      {mp.stock < 10
                        ? `Осталось мало (${mp.stock})`
                        : "В наличии"}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* --- 5. ХАРАКТЕРИСТИКИ --- */}
      {validSpecs.length > 0 && (
        <div className="mt-2 flex flex-col gap-4 border-t border-black/5 pt-8 dark:border-white/10">
          <h3 className="text-foreground text-base font-medium">
            Характеристики
          </h3>
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
