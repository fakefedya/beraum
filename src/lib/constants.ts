export const NAV_LINKS = {
  store: [
    { label: "Каталог", href: "/catalog", isExternal: false },
    { label: "Коллекции", href: "/collections", isExternal: false },
    { label: "О бренде", href: "/about", isExternal: false },
    { label: "Покупателям", href: "/buyers", isExternal: false },
    {
      label: "В интерьере",
      href: "https://external-design.ru",
      isExternal: true,
    },
  ],
  discount: [{ label: "Как купить", href: "/discount/faq", isExternal: false }],
} as const;
