import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/src/server/queries/products";
import { z } from "zod";

// Строгая схема URL-параметров
const querySchema = z
  .object({
    categorySlug: z.string().max(100).optional(),
    q: z.string().max(100).optional(),
    limit: z.coerce.number().min(1).max(100).default(12),
    offset: z.coerce.number().min(0).default(0),
    sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  })
  .catchall(z.union([z.string(), z.array(z.string())]));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Собираем массивы, если ключи дублируются (?color=Белый&color=Черный)
  const rawParams: Record<string, string | string[]> = {};
  searchParams.forEach((value, key) => {
    if (rawParams[key]) {
      rawParams[key] = Array.isArray(rawParams[key])
        ? [...rawParams[key], value]
        : [rawParams[key] as string, value];
    } else {
      rawParams[key] = value;
    }
  });

  const parsed = querySchema.safeParse(rawParams);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, data: [], error: "Invalid Query Parameters" },
      { status: 400 },
    );
  }

  const { categorySlug, q, limit, offset, sort, ...filters } = parsed.data;

  try {
    const result = await getProducts({
      categorySlug,
      limit,
      offset,
      sort,
      q,
      filters: filters as Record<string, string | string[]>,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Ошибка API /api/products:", error);
    return NextResponse.json(
      { success: false, data: [], error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
