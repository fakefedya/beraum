export type FilterConfig = {
  type: "oval" | "round";
  key: string;
  label: string;
  options: string[];
};

export const CATEGORY_FILTERS: Record<string, FilterConfig[]> = {
  hob: [
    {
      type: "oval",
      key: "itemType",
      label: "Тип панели",
      options: ["Газовая", "Индукционная", "Электрическая"],
    },
    {
      type: "round",
      key: "itemBurnerCount",
      label: "Количество конфорок",
      options: ["2", "3", "4", "5"],
    },
    {
      type: "oval",
      key: "itemSurfaceType",
      label: "Материал поверхности",
      options: ["Стеклокерамика", "Закаленное стекло", "Нержавеющая сталь"],
    },
    {
      type: "oval",
      key: "itemSurfaceType1",
      label: "Материал поверхности",
      options: ["Стеклокерамика", "Закаленное стекло", "Нержавеющая сталь"],
    },
  ],
  oven: [
    {
      type: "oval",
      key: "itemType",
      label: "Тип духовки",
      options: ["Электрическая", "Газовая"],
    },
    {
      type: "round",
      key: "itemVolume",
      label: "Объем (л)",
      options: ["45", "50", "65", "70"],
    },
  ],
  refrigerator: [
    {
      type: "oval",
      key: "itemFridgeType",
      label: "Тип холодильника",
      options: ["Встраиваемый", "Отдельностоящий"],
    },
    {
      type: "oval",
      key: "itemDefrostType",
      label: "Система разморозки",
      options: ["No Frost", "Капельная"],
    },
  ],
  // TODO: Дополнить остальными категориями по мере необходимости
};
