import { Icons, type IconsProps } from "@/src/components/ui/icons";

export type MarketplaceProps = {
  id: string;
  isEnabled: boolean;
  type: "Маркетплейс" | "Официальный сайт";
  icon: React.FC<IconsProps>;
  label: string;
  description?: string;
  promoText?: string;
  href?: string;
};

type StoreProps = MarketplaceProps[];
type DiscountProps = StoreProps;

type LinksProps = {
  store: StoreProps;
  discount: DiscountProps;
};

export const MARKETPLACE_LINKS: LinksProps = {
  store: [
    {
      id: "ozon",
      isEnabled: true,
      type: "Маркетплейс",
      icon: Icons.ozon,
      label: "OZON",
      description: "Более 125 000 довольных клиентов",
      promoText: "Скидки по Ozon Карте и быстрая доставка",
      href: "https://www.ozon.ru/seller/beraum-9382/products/?miniapp=seller_9382",
    },
    {
      id: "wb",
      isEnabled: true,
      type: "Маркетплейс",
      icon: Icons.wb,
      label: "Wildberries",
      description: "Скидки постоянным клиентам",
      promoText: "Бесплатная доставка и скидка постоянного покупателя",
      href: "https://www.wildberries.ru/seller/35500",
    },
    {
      id: "ymarket",
      isEnabled: true,
      type: "Маркетплейс",
      icon: Icons.ym,
      label: "Яндекс Маркет",
      description: "Вернем кэшбэк баллами",
      promoText: "Кэшбэк баллами Плюса и оплата Сплитом",
      href: "https://market.yandex.ru/store--beraum-home?businessId=682983",
    },
    {
      id: "mvideo",
      isEnabled: true,
      type: "Маркетплейс",
      icon: Icons.mvideo,
      label: "М.Видео",
      description: "Начислим кэшбэк и баллы",
      promoText: "Рассрочка и бонусы на карту М.Клуб",
      href: "https://www.mvideo.ru/seller/K000059235",
    },
    {
      id: "megamarket",
      isEnabled: false, // Выключен для витрины, но доступен для формы поддержки
      type: "Маркетплейс",
      icon: Icons.megamarket,
      label: "МегаМаркет",
    },
    {
      id: "beraum",
      isEnabled: false,
      type: "Официальный сайт",
      icon: Icons.beraum,
      label: "Beraum",
    },
  ],
  discount: [
    {
      id: "ozon-discount",
      isEnabled: true,
      type: "Маркетплейс",
      icon: Icons.ozon,
      label: "OZON",
      description: "Наш магазин с дисконт техникой",
      href: "https://ozon.ru/s/beraum-589444",
    },
  ],
} as const;

export const VALID_MARKETPLACES = [
  "ozon",
  "wb",
  "ymarket",
  "mvideo",
  "megamarket",
  "beraum",
  "offline",
] as const;
