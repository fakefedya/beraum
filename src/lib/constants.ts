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

export type NavMenu = {
  label: string;
  type: "default" | "mega";
  layout: "grid" | "list";
  colCount?: number;
  items: { label: string; isNew?: boolean; href: string }[];
};

export type NavItem = NavLink | NavExternal | NavMenu;

export const NAV_LINKS: Record<StoreMode, readonly NavItem[]> = {
  store: [
    {
      label: "Каталог",
      type: "mega",
      layout: "grid",
      colCount: 4,
      items: [
        { label: "Варочные панели", isNew: true, href: "/catalog/hobs" },
        { label: "Вытяжки", isNew: false, href: "/catalog/hoods" },
        { label: "Духовые шкафы", isNew: false, href: "/catalog/ovens" },
        { label: "Холодильники", isNew: false, href: "/catalog/fridges" },
        { label: "Морозильники", isNew: false, href: "/catalog/freezers" },
        {
          label: "Посудомоечные машины",
          isNew: false,
          href: "/catalog/dishwashers",
        },
        {
          label: "Микроволновые печи",
          isNew: false,
          href: "/catalog/microwaves",
        },
        { label: "Аэрогрили", isNew: false, href: "/catalog/aerogrils" },
        { label: "Термопоты", isNew: false, href: "/catalog/thermopots" },
        {
          label: "Подогреватели посуды",
          isNew: false,
          href: "/catalog/dish-warmers",
        },
      ],
    },
    {
      label: "Коллекции",
      type: "link",
      href: "/collections",
    },
    {
      label: "Сервис",
      type: "mega",
      layout: "grid",
      colCount: 3,
      items: [
        { label: "Поддержка", href: "/support" },
        { label: "Гарантия", href: "/service" },
        { label: "Частые вопросы", href: "/faq" },
      ],
    },
    {
      label: "О бренде",
      type: "default",
      layout: "list",
      items: [
        {
          label: "О бренде",
          href: "/about",
        },
        {
          label: "Сотрудничество",
          href: "/partnership",
        },
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
