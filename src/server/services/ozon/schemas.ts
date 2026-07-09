import "server-only";
import { z } from "zod";

// Схема для конкретного склада (FBO или FBS)
export const ozonStockItemSchema = z.object({
  type: z.enum(["fbo", "fbs"]), // Нас интересует fbo
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
  result: z.object({
    items: z.array(ozonProductStockSchema),
    last_id: z.string(),
    total: z.number(),
  }),
});

export type OzonProductStock = z.infer<typeof ozonProductStockSchema>;
