type PartnersOfferProps = {
  title: string;
  description: string;
  image: string;
};

export const PARTNERS_OFFER: PartnersOfferProps[] = [
  {
    title: "Девелоперам и рантье",
    description:
      "Комплектуем апартаменты и студии под ключ. Поможем вписаться в смету проекта, дадим оптовую цену и возьмем на себя гарантийное обслуживание.",
    image: "/system-assets/pages/partnership/developer-banner.webp",
  },
  {
    title: "Архитекторам и дизайнерам",
    description:
      "Прозрачная система бонусов за проекты. Выдадим точные 3D-модели техники для ваших визуализаций и закрепим личного менеджера для быстрых ответов.",
    image: "/system-assets/pages/partnership/design-banner.webp",
  },
  {
    title: "Мебельным салонам",
    description:
      "Встроим технику в ваши выставочные кухни на спец-условиях. Возьмем на себя логистику и отгрузим заказы напрямую вашим клиентам со своего склада.",
    image: "/system-assets/pages/partnership/furniture-banner.webp",
  },
  {
    title: "HoReCa",
    description:
      "Оборудуем номерной фонд и зоны питания надежной техникой. Единый строгий дизайн и повышенный ресурс работы для коммерческого использования.",
    image: "/system-assets/pages/partnership/horeca-banner.avif",
  },
] as const;
