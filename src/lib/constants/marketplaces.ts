import { Icons } from "@/src/components/ui/icons";

export const MARKETPLACE_LINKS = {
  store: [
    {
      icon: Icons.ozon,
      label: "OZON",
      description: "Более 125 000 довольных клиентов",
      href: "https://www.ozon.ru/seller/beraum-9382/products/?miniapp=seller_9382",
    },
    {
      icon: Icons.wb,
      label: "Wildberries",
      description: "Скидки постоянным клиентам",
      href: "https://www.wildberries.ru/seller/35500",
    },
    {
      icon: Icons.ym,
      label: "Яндекс Маркет",
      description: "Вернем кэшбэк баллами",
      href: "https://market.yandex.ru/store--beraum-home?businessId=682983",
    },
    {
      icon: Icons.mvideo,
      label: "М.Видео",
      description: "Начислим кэшбэк и баллы",
      href: "https://www.mvideo.ru/seller/K000059235",
    },
  ],
  discount: [
    {
      icon: Icons.ozon,
      label: "OZON",
      description: "Наш магазин с дисконт техникой",
      href: "https://ozon.ru/t/wEfsAwP",
    },
  ],
} as const;
