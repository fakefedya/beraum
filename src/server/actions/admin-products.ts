"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { products } from "@/src/server/db/schema";
import type {
  ProductFilters,
  ProductSpecifications,
} from "@/src/server/db/schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuthRole } from "../utils/auth-check";

const filtersSchema = z
  .string()
  .max(15000)
  .transform((val, ctx): ProductFilters => {
    try {
      const parsed = JSON.parse(val);
      const schema = z.record(
        z.string(),
        z.union([
          z.string(),
          z.number(),
          z.boolean(),
          z.array(z.string()),
          z.null(),
        ]),
      );
      return schema.parse(parsed);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "INVALID_FILTERS_JSON",
      });
      return z.NEVER;
    }
  });

const specificationsSchema = z
  .string()
  .max(15000)
  .transform((val, ctx): ProductSpecifications => {
    try {
      const parsed = JSON.parse(val);
      const schema = z.record(
        z.string(),
        z.union([z.string(), z.number(), z.null()]),
      );
      return schema.parse(parsed);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "INVALID_SPECS_JSON",
      });
      return z.NEVER;
    }
  });

const articleRegex = /^[A-Za-z0-9\-_]+$/;

const updateProductSchema = z.object({
  id: z.string().uuid(),
  siteArticle: z.string().regex(articleRegex).min(1).trim(),
  itemArticle: z.string().regex(articleRegex).min(1).trim(),
  status: z.enum(["draft", "published", "archived"]),
  isLatest: z.preprocess((val) => val === "true" || val === true, z.boolean()),
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
  manualPrice: z.preprocess(
    (val) => (val === "—" || val === null ? null : Number(val)),
    z.number().nullable().optional(),
  ),
  ozonLink: z.string().url().or(z.literal("")).optional(),
  wbLink: z.string().url().or(z.literal("")).optional(),
  ymarketLink: z.string().url().or(z.literal("")).optional(),
  mvideoLink: z.string().url().or(z.literal("")).optional(),
  filters: filtersSchema,
  specifications: specificationsSchema,
});

export async function updateProductAction(formData: FormData) {
  try {
    await requireAuthRole(["superadmin", "manager"]);
    const rawData = Object.fromEntries(formData.entries());
    const parsed = updateProductSchema.safeParse(rawData);

    if (!parsed.success) return { success: false, error: "INVALID_DATA" };

    const data = parsed.data;

    const [existingSku] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.itemArticle, data.itemArticle));

    if (existingSku && existingSku.id !== data.id) {
      return { success: false, error: `SKU_EXISTS` };
    }

    await db
      .update(products)
      .set({
        siteArticle: data.siteArticle,
        itemArticle: data.itemArticle,
        status: data.status,
        isLatest: data.isLatest,
        discountPercentage: data.discountPercentage,
        manualPrice: data.manualPrice,
        ozonLink: data.ozonLink || null,
        wbLink: data.wbLink || null,
        ymarketLink: data.ymarketLink || null,
        mvideoLink: data.mvideoLink || null,
        filters: data.filters,
        specifications: data.specifications,
        updatedAt: new Date(),
      })
      .where(eq(products.id, data.id));

    revalidateTag("products", { expire: 0 });
    revalidatePath("/dashboard/products");

    return { success: true };
  } catch (error) {
    return { success: false, error: "DB_ERROR" };
  }
}

const createProductSchema = z.object({
  categoryId: z.string().uuid(),
  siteArticle: z.string().regex(articleRegex).min(1).trim(),
  itemArticle: z.string().regex(articleRegex).min(1).trim(),
  colorName: z.string().optional(),
});

export async function createProductAction(formData: FormData) {
  try {
    await requireAuthRole(["superadmin", "manager"]);
    const rawData = Object.fromEntries(formData.entries());
    const parsed = createProductSchema.safeParse(rawData);

    if (!parsed.success) return { success: false, error: "INVALID_DATA" };

    const data = parsed.data;

    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.itemArticle, data.itemArticle));

    if (existing) return { success: false, error: `SKU_EXISTS` };

    await db.insert(products).values({
      categoryId: data.categoryId,
      siteArticle: data.siteArticle,
      itemArticle: data.itemArticle,
      colorName: data.colorName || null,
      status: "draft",
      filters: {},
      specifications: {},
    });

    revalidateTag("products", { expire: 0 });
    revalidatePath("/dashboard/products");

    return { success: true };
  } catch (error) {
    return { success: false, error: "DB_ERROR" };
  }
}
