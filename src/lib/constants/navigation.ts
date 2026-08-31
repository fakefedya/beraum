export type NavLink = {
  label: string;
  isDisabled: boolean;
  type: "link";
  href: string;
};
export type NavExternal = {
  label: string;
  isDisabled: boolean;
  type: "external";
  href: string;
  target?: "_blank" | "_self";
};
export type NavMenuMega = {
  label: string;
  isDisabled: boolean;
  type: "mega";
  sidebarLinks: { label: string; isNew?: boolean; href: string }[];
  promoCards: {
    label: string;
    description: string;
    href: string;
    isNew?: boolean;
    cover?: string;
  }[];
};
export type NavMenuDefault = {
  label: string;
  type: "default";
  items: { label: string; href: string; cover: string; description: string }[];
};
export type NavItem = NavLink | NavExternal | NavMenuDefault | NavMenuMega;

type StoreMode = "store" | "discount";

export const NAV_LINKS: Record<StoreMode, readonly NavItem[]> = {
  store: [
    {
      label: "Каталог",
      isDisabled: false,
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
        {
          label: "Угольные фильтры",
          href: "/catalog/carbon-filter",
          isNew: false,
        },
      ],
      promoCards: [
        {
          label: "HI-3C004MW",
          description: "Дизайнерская овальная панель",
          href: "/product/HI-3C004MW",
          isNew: true,
          cover: "system-assets/components/navigation/promo-cover-2.jpg",
        },
        {
          label: "HI-2CR351MB",
          description: "Дизайнерская овальная панель",
          href: "/product/HI-2CR351MB",
          isNew: true,
          cover: "system-assets/components/navigation/promo-cover-1.jpg",
        },
      ],
    },
    {
      label: "Коллекции",
      isDisabled: true,
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
          cover: "system-assets/components/navigation/about-cover.png",
          description: "Узнайте о нашей миссии и подходе к производству",
        },
        {
          label: "Сотрудничество",
          href: "/partnership",
          cover: "system-assets/components/navigation/partnership-cover.png",
          description: "Индивидуальные условия для B2B и дизайнеров",
        },
      ],
    },
    {
      label: "Сервис",
      type: "default",
      items: [
        {
          label: "Поддержка",
          href: "/support",
          cover: "system-assets/components/navigation/support-cover.png",
          description: "Прямая связь с техническими инженерами",
        },
        {
          label: "Гарантия",
          href: "/service",
          cover: "system-assets/components/navigation/service-cover.png",
          description: "Полная защита и честные условия обслуживания",
        },
        {
          label: "Вопросы и ответы",
          href: "/faq",
          cover: "system-assets/components/navigation/faq-cover.png",
          description: "Ответы на самые частые вопросы клиентов",
        },
      ],
    },
    {
      label: "Студия дизайна",
      isDisabled: false,
      type: "external",
      href: "https://design.beraum.com",
      target: "_blank",
    },
  ],
  discount: [
    { label: "О бренде", isDisabled: false, type: "link", href: "/about" },
    { label: "Поддержка", isDisabled: false, type: "link", href: "/support" },
  ],
} as const;

export type FooterLink = {
  label: string;
  href: string;
};

export const FOOTER_LINKS: FooterLink[] = [
  {
    label: "Политика конфиденциальности",
    href: "/policies/privacy",
  },
  {
    label: "Согласие на обработку данных",
    href: "/policies/consent",
  },
  {
    label: "Пользовательское соглашение",
    href: "/policies/terms",
  },
  {
    label: "Гарантия и возврат",
    href: "/policies/returns",
  },
  {
    label: "Реквизиты",
    href: "/policies/requisites",
  },
] as const;
