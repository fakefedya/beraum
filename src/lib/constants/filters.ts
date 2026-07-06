// src/lib/constants/filters.ts

export type FilterConfig = {
  key: string;
  label: string;
  options: string[];
};

export const CATEGORY_FILTERS: Record<string, FilterConfig[]> = {
  hob: [
    {
      key: "itemType",
      label: "Тип панели",
      options: ["Индукционная", "Электрическая", "Газовая"],
    },
    {
      key: "itemBurnerCount",
      label: "Количество конфорок",
      options: ["2", "3", "4", "5"],
    },
    {
      key: "itemSurfaceType",
      label: "Материал поверхности",
      options: ["Стеклокерамика", "Закаленное стекло", "Нержавеющая сталь"],
    },
  ],
  oven: [
    {
      key: "itemType",
      label: "Тип духовки",
      options: ["Электрическая", "Газовая"],
    },
    {
      key: "itemVolume",
      label: "Объем (л)",
      options: ["45", "50", "65", "70"],
    },
  ],
  refrigerator: [
    {
      key: "itemFridgeType",
      label: "Тип холодильника",
      options: ["Встраиваемый", "Отдельностоящий"],
    },
    {
      key: "itemDefrostType",
      label: "Система разморозки",
      options: ["No Frost", "Капельная"],
    },
  ],
  // TODO: Дополнить остальными категориями по мере необходимости
};
