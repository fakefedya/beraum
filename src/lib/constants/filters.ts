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
      key: "type",
      label: "Тип панели",
      options: ["Газовая", "Индукционная", "Электрическая"],
    },
    {
      type: "round",
      key: "burnerCount",
      label: "Количество конфорок",
      options: ["2", "3", "4"],
    },
    {
      type: "round",
      key: "width",
      label: "Ширина, см",
      options: ["35"],
    },
    {
      type: "oval",
      key: "controlType",
      label: "Тип управления",
      options: ["Механическое", "Сенсорное", "Электронное"],
    },
    {
      type: "oval",
      key: "surfaceMaterial",
      label: "Материал поверхности",
      options: ["Стеклокерамика", "Закаленное стекло", "Нержавеющая сталь"],
    },
    {
      type: "oval",
      key: "color",
      label: "Цвет",
      options: ["Черный", "Белый", "Черный матовый", "Белый матовый"],
    },
    {
      type: "oval",
      key: "protection",
      label: "Системы защиты",
      options: [
        "Защита от пролива",
        "Защита от перегрева",
        "Блокировка от детей",
      ],
    },
    {
      type: "oval",
      key: "feature",
      label: "Особенности",
      options: [
        "Датчик обнаружения посуды",
        "Быстрый нагрев",
        "Непрерывный инверторный нагрев",
        "Индикатор остаточного тепла",
      ],
    },
  ],
  hood: [
    {
      type: "oval",
      key: "formFactor",
      label: "Форм-фактор вытяжки",
      options: ["Встраиваемая", "Наклонная", "Купольная", "Цилиндрическая"],
    },
    {
      type: "round",
      key: "width",
      label: "Ширина, см",
      options: ["45", "50", "60", "90"],
    },
    {
      type: "oval",
      key: "controlType",
      label: "Тип управления",
      options: ["Механическое", "Сенсорное", "Жестами", "Пульт ДУ"],
    },
    {
      type: "oval",
      key: "color",
      label: "Цвет",
      options: ["Черный", "Белый", "Нержавеющая сталь"],
    },
    {
      type: "oval",
      key: "performance",
      label: "Производительность, м³/ч",
      options: ["500", "800", "1000", "1200"],
    },
    {
      type: "oval",
      key: "feature",
      label: "Особенности",
      options: ["Инверторный мотор"],
    },
  ],
  oven: [
    {
      type: "oval",
      key: "functionality",
      label: "Функционал духовки",
      options: ["Гриль", "Конвекция", "СВЧ"],
    },
    {
      type: "round",
      key: "width",
      label: "Ширина, см",
      options: ["45", "60", "90"],
    },
    {
      type: "oval",
      key: "controlType",
      label: "Тип управления",
      options: ["Сенсорное", "Механическое", "Комбинированное"],
    },
    {
      type: "round",
      key: "volume",
      label: "Объем, л",
      options: ["45", "50", "65", "70"],
    },
    {
      type: "oval",
      key: "color",
      label: "Цвет",
      options: ["Черный", "Белый", "Нержавеющая сталь"],
    },
    {
      type: "oval",
      key: "guides",
      label: "Телескопические направляющие",
      options: ["Да", "Нет"],
    },
    {
      type: "round",
      key: "glassCount",
      label: "Количество стекол дверцы",
      options: ["1", "2", "3", "4"],
    },
    {
      type: "oval",
      key: "management",
      label: "Управление духовкой",
      options: [
        "Таймер",
        "Дисплей",
        "Утапливаемые переключатели",
        "Автоприготовление",
      ],
    },
  ],
  refrigerator: [
    {
      type: "oval",
      key: "installation",
      label: "Тип установки",
      options: ["Отдельностоящая", "Встраиваемая"],
    },
    {
      type: "oval",
      key: "type",
      label: "Вид холодильника",
      options: ["С морозильной камерой", "Без морозильной камеры"],
    },
    {
      type: "oval",
      key: "defrost",
      label: "Размораживание",
      options: ["No frost", "Капельное"],
    },
    {
      type: "oval",
      key: "color",
      label: "Цвет",
      options: ["Черный", "Белый", "Серебристый", "Бежевый"],
    },
    {
      type: "oval",
      key: "compressor",
      label: "Вид компрессора",
      options: ["Инверторный", "Поршневой"],
    },
    {
      type: "oval",
      key: "feature",
      label: "Функционал",
      options: ["Суперзаморозка", "Суперохлаждение", "Авторазморозка"],
    },
  ],
  freezer: [
    {
      type: "oval",
      key: "installation",
      label: "Тип установки",
      options: ["Отдельностоящая", "Встраиваемая"],
    },
    {
      type: "oval",
      key: "defrost",
      label: "Размораживание",
      options: ["No frost", "Капельное"],
    },
    {
      type: "oval",
      key: "color",
      label: "Цвет",
      options: ["Черный", "Белый", "Серебристый"],
    },
    {
      type: "oval",
      key: "compressor",
      label: "Вид компрессора",
      options: ["Инверторный", "Поршневой"],
    },
    {
      type: "oval",
      key: "feature",
      label: "Функционал",
      options: ["Суперзаморозка", "Суперохлаждение", "Авторазморозка"],
    },
  ],
  dishwasher: [
    {
      type: "oval",
      key: "type",
      label: "Вид",
      options: ["Компактная", "Узкая (45 см)", "Полноразмерная (60 см)"],
    },
    {
      type: "oval",
      key: "installation",
      label: "Тип установки",
      options: ["Отдельностоящая", "Встраиваемая"],
    },
    {
      type: "oval",
      key: "color",
      label: "Цвет",
      options: ["Черный", "Белый", "Серебристый"],
    },
    {
      type: "oval",
      key: "inverter",
      label: "Инверторный двигатель",
      options: ["Да", "Нет"],
    },
    {
      type: "round",
      key: "capacity",
      label: "Вместительность (комплектов)",
      options: ["3", "10", "14"],
    },
    {
      type: "oval",
      key: "feature",
      label: "Особенности",
      options: ["Таймер", "Луч на полу", "Использование средств 3-в-1"],
    },
    {
      type: "oval",
      key: "protection",
      label: "Системы защиты",
      options: [
        "Защита от протечек",
        "Автоотключение",
        "Блокировка от детей",
        "AquaStop",
      ],
    },
  ],
  microwave: [
    {
      type: "oval",
      key: "installation",
      label: "Тип установки",
      options: ["Отдельностоящая", "Встраиваемая"],
    },
    {
      type: "oval",
      key: "controlType",
      label: "Управление",
      options: ["Сенсорное", "Электронное", "Механическое"],
    },
    {
      type: "oval",
      key: "color",
      label: "Цвет",
      options: ["Черный", "Белый", "Серебристый"],
    },
    {
      type: "round",
      key: "volume",
      label: "Объем, л",
      options: ["20", "23", "25"],
    },
    {
      type: "oval",
      key: "mode",
      label: "Режим работы",
      options: ["С грилем", "С грилем и конвекцией", "Соло"],
    },
    {
      type: "oval",
      key: "feature",
      label: "Особенности",
      options: ["Таймер", "Поворотный стол", "Угольные фильтры"],
    },
  ],
};
