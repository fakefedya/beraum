import "server-only";
import { z } from "zod";

// Схема для конкретного склада (FBO или FBS)
export const ozonStockItemSchema = z.object({
  type: z.string(), // Нас интересует fbo
  present: z.number(), // Доступно к продаже
  reserved: z.number(), // В резерве
});

// Схема одного товара из ответа
export const ozonProductStockSchema = z.object({
  product_id: z.number(),
  offer_id: z.string().min(1, "offer_id не может быть пустым"),
  stocks: z.array(ozonStockItemSchema),
});

// Общая схема ответа (API /v3/product/info/stocks)
export const ozonStocksResponseSchema = z.object({
  items: z.array(ozonProductStockSchema),
  last_id: z.string().optional().default(""),
  total: z.number().optional().default(0),
});

export type OzonProductStock = z.infer<typeof ozonProductStockSchema>;
