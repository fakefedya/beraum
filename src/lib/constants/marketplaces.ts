import { Icons } from "@/src/components/ui/icons";

export const MARKETPLACE_LINKS = {
  store: [
    {
      icon: Icons.ozon,
      label: "OZON",
      description: "Более 90 000 довольных клиентов",
      href: "https://ozon.ru/seller/...",
    },
    {
      icon: Icons.wb,
      label: "Wildberries",
      description: "Скидки постоянным клиентам",
      href: "https://wildberries.ru/seller/...",
    },
    {
      icon: Icons.ym,
      label: "Яндекс Маркет",
      description: "Вернем кэшбэк баллами",
      href: "https://market.yandex.ru/business/...",
    },
    {
      icon: Icons.mvideo,
      label: "М.Видео",
      description: "Начислим кэшбэк и баллы",
      href: "https://mvideo.ru/...",
    },
  ],
  discount: [
    {
      icon: Icons.ozon,
      label: "OZON",
      description: "Наш магазин с дисконт техникой",
      href: "https://ozon.ru/seller/discount...",
    },
  ],
} as const;
