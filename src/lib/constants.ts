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
  promoAspectRatio: "horizontal" | "square" | "vertical";
  promoColumnCount: number;
};

export type NavMenuDefault = {
  label: string;
  type: "default";
  items: { label: string; href: string; cover: string }[];
  columnCount: number;
  aspectRatio: "horizontal" | "square" | "vertical";
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
          href: "/catalog/hobs",
          isNew: true,
        },
        {
          label: "Вытяжки",
          href: "/catalog/hoods",
          isNew: true,
        },
        {
          label: "Духовые шкафы",
          isNew: false,
          href: "/catalog/ovens",
        },
        {
          label: "Холодильники",
          href: "/catalog/fridges",
          isNew: false,
        },
        {
          label: "Морозильники",
          href: "/catalog/freezers",
          isNew: false,
        },
        {
          label: "Посудомоечные машины",
          href: "/catalog/dishwashers",
          isNew: false,
        },
        {
          label: "Микроволновые печи",
          href: "/catalog/microwaves",
          isNew: false,
        },
        {
          label: "Аэрогрили",
          isNew: false,
          href: "/catalog/aerogrils",
        },
        {
          label: "Термопоты",
          isNew: true,
          href: "/catalog/thermopots",
        },
        {
          label: "Угольные фильтры",
          isNew: false,
          href: "/catalog/carbon-filters",
        },
      ],
      promoCards: [
        {
          label: "Варочные панели",
          description: "Овальная панель",
          href: "/catalog/hobs",
          isNew: true,
          cover: "path/to/image",
        },
        {
          label: "Вытяжки",
          description: "Овальная панель",
          href: "/catalog/hoods",
          isNew: true,
          cover: "path/to/image",
        },
        {
          label: "Духовые шкафы",
          description: "Овальная панель",
          isNew: false,
          href: "/catalog/ovens",
          cover: "path/to/image",
        },
      ],
      promoAspectRatio: "vertical",
      promoColumnCount: 3,
    },
    {
      label: "Коллекции",
      type: "link",
      href: "/collections",
    },
    {
      label: "О бренде",
      type: "default",
      columnCount: 3,
      aspectRatio: "horizontal",
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
      columnCount: 3,
      aspectRatio: "horizontal",
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
      label: "Ответы на вопросы",
      href: "/discount/faq",
      type: "link",
    },
  ],
} as const;

export const MARKETPLACE_LINKS = {
  store: [
    {
      icon: "OZON_logo",
      label: "OZON",
      description: "Более 90 000 довольных клиентов",
      href: "https://ozon.ru/seller/...",
    },
    {
      icon: "WB_logo",
      label: "Wildberries",
      description: "Скидки постоянным клиентам",
      href: "https://wildberries.ru/seller/...",
    },
    {
      icon: "YM_logo",
      label: "Яндекс Маркет",
      description: "Вернем кэшбэк баллами",
      href: "https://market.yandex.ru/business/...",
    },
    {
      icon: "MVideo_logo",
      label: "М.Видео",
      description: "Начислим кэшбэк и баллы",
      href: "https://mvideo.ru/...",
    },
  ],
  discount: [
    {
      icon: "OZON_logo",
      label: "OZON",
      description: "Дисконт техника",
      href: "https://ozon.ru/seller/discount...",
    },
  ],
} as const;
