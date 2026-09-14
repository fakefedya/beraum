import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { getDiscountItemBySku } from "@/src/server/queries/discount";

type DiscountDetails = NonNullable<
  Awaited<ReturnType<typeof getDiscountItemBySku>>["data"]
>;

interface DiscountItemInfoProps {
  item: DiscountDetails;
}

export const DiscountItemInfo = ({ item }: DiscountItemInfoProps) => {
  const hasBasePrice = item.basePrice && item.basePrice > 0;
  const savings = hasBasePrice
    ? Math.round(
        ((item.basePrice! - item.discountPrice) / item.basePrice!) * 100,
      )
    : 0;

  const isAvailable = item.status === "available";

  const validSpecs = Object.entries(item.specifications || {}).filter(
    ([_, val]) => val !== null && val !== "",
  );

  return (
    <div className={cn("flex flex-col gap-10", "md:gap-16")}>
      <div className="flex flex-col gap-6">
        <Badge className="bg-brand text-foreground w-fit text-xs leading-normal font-medium uppercase">
          Дисконт
        </Badge>

        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-lg text-balance">
            {item.categoryName}
          </span>
          <h1 className="text-foreground text-3xl font-semibold uppercase lg:text-4xl">
            {item.siteArticle}
          </h1>
          <span className="text-muted-foreground font-mono text-sm font-medium">
            SKU: {item.uniqueSku}
          </span>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-3">
              <span className="text-foreground text-3xl font-medium">
                {item.discountPrice.toLocaleString("ru-RU")} ₽
              </span>
              {hasBasePrice && (
                <span className="text-muted-foreground mb-1 text-lg line-through">
                  {item.basePrice!.toLocaleString("ru-RU")} ₽
                </span>
              )}
              {savings > 0 && (
                <Badge className="bg-brand text-foreground mb-2 text-xs font-semibold uppercase shadow-sm">
                  Выгода {savings}%
                </Badge>
              )}
            </div>

            {isAvailable ? (
              <div className="text-foreground flex items-center gap-1.5 text-sm font-medium">
                <CheckCircle2
                  className="text-brand-secondary size-5"
                  aria-hidden="true"
                />
                <span>В наличии (1 шт.)</span>
              </div>
            ) : (
              <div className="text-destructive flex items-center gap-1.5 text-sm font-medium">
                <XCircle
                  className="size-5"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>
                  {item.status === "reserved" ? "В резерве" : "Продан"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-orange-50 p-6 dark:bg-orange-950/30">
        <div className="flex items-center gap-2 font-medium text-orange-800 dark:text-orange-300">
          <AlertTriangle className="size-5 shrink-0" />
          <h2 className="text-lg">Причина уценки</h2>
        </div>
        <p className="text-sm leading-relaxed text-orange-800/80 dark:text-orange-300/80">
          {item.defectDescription}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {isAvailable ? (
          <Button
            size="lg"
            className="h-14 w-full rounded-xl text-base font-semibold transition-transform active:scale-[0.98] md:w-fit md:px-12"
          >
            Оформить заказ
          </Button>
        ) : (
          <div className="bg-muted flex items-start gap-3 rounded-xl p-4">
            <Info className="text-muted-foreground mt-0.5 size-5 shrink-0" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Данный экземпляр уже выкуплен или находится в резерве. Обратите
              внимание на похожие товары из этой же категории.
            </p>
          </div>
        )}
      </div>

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
