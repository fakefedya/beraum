import "server-only";
import { z } from "zod";

export const ozonStockItemSchema = z.object({
  type: z.string(),
  present: z.number(),
  reserved: z.number(),
});

export const ozonProductStockSchema = z.object({
  product_id: z.number(),
  offer_id: z.string().min(1, "offer_id не может быть пустым"),
  stocks: z.array(ozonStockItemSchema),
});

export const ozonStocksResponseSchema = z.object({
  items: z.array(ozonProductStockSchema),
  last_id: z.string().optional().default(""),
  total: z.number().optional().default(0),
});

export type OzonProductStock = z.infer<typeof ozonProductStockSchema>;
