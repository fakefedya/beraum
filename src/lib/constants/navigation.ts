export type NavLink = { label: string; type: "link"; href: string };
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

type StoreMode = "store" | "discount";

export const NAV_LINKS: Record<StoreMode, readonly NavItem[]> = {
  store: [
    {
      label: "Каталог",
      type: "mega",
      sidebarLinks: [
        { label: "Варочные панели", href: "/catalog/hob", isNew: true },
        { label: "Вытяжки", href: "/catalog/hood", isNew: true },
        { label: "Духовые шкафы", href: "/catalog/oven", isNew: false },
        { label: "Холодильники", href: "/catalog/refrigerator", isNew: false },
        { label: "Морозильники", href: "/catalog/freezer", isNew: false },
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
        { label: "Аэрогрили", href: "/catalog/air-fryer", isNew: false },
        { label: "Термопоты", href: "/catalog/water-dispenser", isNew: true },
        {
          label: "Угольные фильтры",
          href: "/catalog/carbon-filter",
          isNew: false,
        },
      ],
      promoCards: [
        {
          label: "HI-2CR591",
          description: "Дизайнерская овальная панель",
          href: "/catalog/hob",
          isNew: true,
          cover: "",
        },
        {
          label: "HI-3CR451",
          description: "Овальная панель",
          href: "/catalog/hood",
          isNew: true,
          cover: "",
        },
        {
          label: "HI-4CR591",
          description: "Уникальность технологий",
          href: "/catalog/oven",
          isNew: true,
          cover: "",
        },
      ],
    },
    { label: "Коллекции", type: "link", href: "/collections" },
    {
      label: "О бренде",
      type: "default",
      items: [
        { label: "О бренде", href: "/about", cover: "" },
        { label: "Сотрудничество", href: "/partnership", cover: "" },
      ],
    },
    {
      label: "Сервис",
      type: "default",
      items: [
        { label: "Поддержка", href: "/support", cover: "" },
        { label: "Гарантия", href: "/service", cover: "" },
        { label: "Частые вопросы", href: "/faq", cover: "" },
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
        { label: "О дисконте", href: "/discount/about", cover: "" },
        {
          label: "Сделать оптовое предложение",
          href: "/discount/partnership",
          cover: "",
        },
      ],
    },
    {
      label: "Сервис",
      type: "default",
      items: [
        { label: "Поддержка", href: "/support", cover: "" },
        { label: "Частые вопросы", href: "/faq", cover: "" },
      ],
    },
  ],
} as const;
