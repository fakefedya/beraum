import { Icons } from "@/src/components/ui/icons";

// type MarketProps = {
//   isEnabled: boolean;
//   icon
// };

export const MARKETPLACE_LINKS = {
  store: [
    {
      isEnabled: true,
      type: "Маркетплейс",
      icon: Icons.ozon,
      label: "OZON",
      description: "Более 125 000 довольных клиентов",
      href: "https://www.ozon.ru/seller/beraum-9382/products/?miniapp=seller_9382",
    },
    {
      isEnabled: true,
      type: "Маркетплейс",
      icon: Icons.wb,
      label: "Wildberries",
      description: "Скидки постоянным клиентам",
      href: "https://www.wildberries.ru/seller/35500",
    },
    {
      isEnabled: true,
      type: "Маркетплейс",
      icon: Icons.ym,
      label: "Яндекс Маркет",
      description: "Вернем кэшбэк баллами",
      href: "https://market.yandex.ru/store--beraum-home?businessId=682983",
    },
    {
      isEnabled: true,
      type: "Маркетплейс",
      icon: Icons.mvideo,
      label: "М.Видео",
      description: "Начислим кэшбэк и баллы",
      href: "https://www.mvideo.ru/seller/K000059235",
    },
    {
      isEnabled: false,
      type: "Маркетплейс",
      icon: Icons.megamarket,
      label: "МегаМаркет",
      description: "",
      href: "",
    },
    {
      isEnabled: false,
      type: "Официальный сайт",
      icon: Icons.beraum,
      label: "Beraum",
      description: "",
      href: "",
    },
  ],
  discount: [
    {
      isEnabled: true,
      type: "Маркетплейс",
      icon: Icons.ozon,
      label: "OZON",
      description: "Наш магазин с дисконт техникой",
      href: "https://ozon.ru/t/wEfsAwP",
    },
  ],
} as const;
