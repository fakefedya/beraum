import "server-only";

// Искусственная задержка для обхода Rate Limits
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Разбиение массива на чанки для удобства записи в БД
export function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
}
