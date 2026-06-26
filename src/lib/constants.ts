export const NAV_LINKS = {
  store: [
    {
      label: "Каталог",
      type: "dropdown",
      layout: "cards",
      items: [
        {
          label: "Варочные панели",
          href: "/catalog/hobs",
        },
        {
          label: "Вытяжки",
          href: "/catalog/hoods",
        },
        {
          label: "Духовые шкафы",
          href: "/catalog/ovens",
        },
        {
          label: "Холодильники",
          href: "/catalog/fridges",
        },
        {
          label: "Морозильники",
          href: "/catalog/freezers",
        },
        {
          label: "Посудомоечные машины",
          href: "/catalog/dishwashers",
        },
        {
          label: "Микроволновые печи",
          href: "/catalog/microwaves",
        },
        {
          label: "Аэрогрили",
          href: "/catalog/aerogrils",
        },
        {
          label: "Термопоты",
          href: "/catalog/thermopots",
        },
        {
          label: "Подогреватели посуды",
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
      label: "О бренде",
      type: "dropdown",
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
      label: "Сервис",
      type: "dropdown",
      layout: "list",
      items: [
        {
          label: "Поддержка",
          href: "/support",
        },
        {
          label: "Гарантия",
          href: "/service",
        },
        {
          label: "Частые вопросы",
          href: "/faq",
        },
        {
          label: "Документация",
          href: "/docs",
        },
      ],
    },
    {
      label: "Студия дизайна",
      href: "https://design.beraum.com",
      target: "_blank",
      type: "external",
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
