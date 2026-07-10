import "server-only";
import { z } from "zod";

export const wbStockItemSchema = z
  .object({
    sku: z.union([z.string(), z.number()]).optional(),
    chrtId: z.number().optional(),
    amount: z.number(),
  })
  .passthrough();

export const wbStocksResponseSchema = z
  .object({
    stocks: z.array(wbStockItemSchema),
  })
  .passthrough();
