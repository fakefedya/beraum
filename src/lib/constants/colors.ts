import { CSSProperties } from "react";

export const COLOR_SWATCH_MAP: Record<string, string> = {
  Черный: "#111111", // Поднят от абсолютного нуля, чтобы был виден глянцевый блик
  "Черный матовый": "#3A3A3C", // Графитовый для визуального отличия
  Белый: "#FFFFFF",
  "Белый матовый": "#F4F4F5",
  Бежевый: "#E5D3B3",
  Золотой: "#D4AF37",
  Желтый: "#FCD34D",
  Красный: "#EF4444",
  "Серый металлик": "#9CA3AF",
  Серый: "#6B7280",
};

export const DEFAULT_SWATCH_COLOR = "#E5E7EB";

const NORMALIZED_SWATCH_MAP = Object.entries(COLOR_SWATCH_MAP).reduce(
  (acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  },
  {} as Record<string, string>,
);

export function getSwatchStyle(colorString?: string | null): CSSProperties {
  const isMatte = colorString?.toLowerCase().includes("матовый");

  // Универсальный контур (защита белого от сливания с фоном)
  const baseBorder = "inset 0 0 0 1px rgba(0,0,0,0.1)";

  // Мягкий 3D-блик для глянца (свет сверху, тень снизу)
  const glossyGlare =
    "inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.2)";

  // Матовая фактура: почти плоская, легчайшее затенение
  const matteTexture = "inset 0 1px 3px rgba(0,0,0,0.05)";

  const boxShadow = isMatte
    ? `${baseBorder}, ${matteTexture}`
    : `${baseBorder}, ${glossyGlare}`;
  const baseStyle: CSSProperties = { boxShadow };

  if (!colorString)
    return { backgroundColor: DEFAULT_SWATCH_COLOR, ...baseStyle };

  const colors = colorString.split(",").map((c) => c.trim().toLowerCase());

  if (colors.length === 1) {
    return {
      backgroundColor: NORMALIZED_SWATCH_MAP[colors[0]] || DEFAULT_SWATCH_COLOR,
      ...baseStyle,
    };
  }

  const color1 = NORMALIZED_SWATCH_MAP[colors[0]] || DEFAULT_SWATCH_COLOR;
  const color2 = NORMALIZED_SWATCH_MAP[colors[1]] || DEFAULT_SWATCH_COLOR;

  return {
    // Сглаживание 2% (49-51) убирает пиксельную "лесенку" на диагонали
    backgroundImage: `linear-gradient(135deg, ${color1} 49%, ${color2} 51%)`,
    ...baseStyle,
  };
}
