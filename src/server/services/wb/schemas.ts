import "server-only";
import { z } from "zod";

export const wbStockItemSchema = z
  .object({
    sku: z.union([z.string(), z.number()]).optional(),
    chrtId: z.number().optional(),
    amount: z
      .number()
      .nullable()
      .catch(0)
      .transform((val) => val ?? 0),
  })
  .passthrough();

export const wbStocksResponseSchema = z
  .object({
    stocks: z.array(wbStockItemSchema),
  })
  .passthrough();

export const wbPriceItemSchema = z
  .object({
    vendorCode: z.string(),
    sizes: z
      .array(
        z.object({
          price: z.number().catch(0),
          discountedPrice: z.number().catch(0),
        }),
      )
      .min(1),
  })
  .passthrough();

export const wbPricesResponseSchema = z
  .object({
    data: z
      .object({
        listGoods: z.array(wbPriceItemSchema).default([]),
      })
      .passthrough(),
  })
  .passthrough();
