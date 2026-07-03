import { Icons } from "@/src/components/ui/icons";

type StoreMode = "store" | "discount";

export type NavLink = {
  label: string;
  type: "link";
  href: string;
};

export type NavExternal = {
  label: string;
  type: "external";
  href: string;
  target?: "_blank" | "_self";
};

export type NavMenuMega = {
  label: string;
  type: "mega";
  sidebarLinks: { label: string; isNew?: boolean; href: string }[];
  promoCards: {
    label: string;
    description: string;
    href: string;
    isNew?: boolean;
    cover: string;
  }[];
};

export type NavMenuDefault = {
  label: string;
  type: "default";
  items: { label: string; href: string; cover: string }[];
};

export type NavItem = NavLink | NavExternal | NavMenuDefault | NavMenuMega;

export const NAV_LINKS: Record<StoreMode, readonly NavItem[]> = {
  store: [
    {
      label: "Каталог",
      type: "mega",
      sidebarLinks: [
        {
          label: "Варочные панели",
          href: "/catalog/hob",
          isNew: true,
        },
        {
          label: "Вытяжки",
          href: "/catalog/hood",
          isNew: true,
        },
        {
          label: "Духовые шкафы",
          href: "/catalog/oven",
          isNew: false,
        },
        {
          label: "Холодильники",
          href: "/catalog/refrigerator",
          isNew: false,
        },
        {
          label: "Морозильники",
          href: "/catalog/freezer",
          isNew: false,
        },
        {
          label: "Посудомоечные машины",
          href: "/catalog/dishwasher",
          isNew: true,
        },
        {
          label: "Микроволновые печи",
          href: "/catalog/microwave",
          isNew: false,
        },
        {
          label: "Аэрогрили",
          isNew: false,
          href: "/catalog/air-fryer",
        },
        {
          label: "Термопоты",
          isNew: true,
          href: "/catalog/water-dispenser",
        },
        {
          label: "Угольные фильтры",
          isNew: false,
          href: "/catalog/carbon-filter",
        },
      ],
      promoCards: [
        {
          label: "HI-2CR591",
          description: "Дизайнерская овальная панель",
          href: "/catalog/hobs",
          isNew: true,
          cover: "path/to/image",
        },
        {
          label: "HI-3CR451",
          description: "Овальная панель",
          href: "/catalog/hoods",
          isNew: true,
          cover: "path/to/image",
        },
        {
          label: "HI-4CR591",
          description: "Уникальность технологий",
          isNew: true,
          href: "/catalog/ovens",
          cover: "path/to/image",
        },
      ],
    },
    {
      label: "Коллекции",
      type: "link",
      href: "/collections",
    },
    {
      label: "О бренде",
      type: "default",
      items: [
        {
          label: "О бренде",
          href: "/about",
          cover: "path/to/image",
        },
        {
          label: "Сотрудничество",
          href: "/partnership",
          cover: "path/to/image",
        },
      ],
    },
    {
      label: "Сервис",
      type: "default",
      items: [
        { label: "Поддержка", href: "/support", cover: "path/to/image" },
        { label: "Гарантия", href: "/service", cover: "path/to/image" },
        { label: "Частые вопросы", href: "/faq", cover: "path/to/image" },
      ],
    },
    {
      label: "Студия дизайна",
      type: "external",
      href: "https://design.beraum.com",
      target: "_blank",
    },
  ],
  discount: [
    {
      label: "О дисконте",
      type: "default",
      items: [
        {
          label: "О дисконте",
          href: "/discount/about",
          cover: "path/to/image",
        },
        {
          label: "Сделать оптовое предложение",
          href: "/discount/partnership",
          cover: "path/to/image",
        },
      ],
    },
    {
      label: "Сервис",
      type: "default",
      items: [
        { label: "Поддержка", href: "/support", cover: "path/to/image" },
        { label: "Частые вопросы", href: "/faq", cover: "path/to/image" },
      ],
    },
  ],
} as const;

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
