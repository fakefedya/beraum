import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/src/server/queries/products";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const categorySlug = searchParams.get("categorySlug") || undefined;
  const q = searchParams.get("q") || undefined;
  const limit = Number(searchParams.get("limit")) || 12;
  const offset = Number(searchParams.get("offset")) || 0;
  const sort = searchParams.get("sort") || "newest";

  const systemKeys = new Set(["categorySlug", "q", "limit", "offset", "sort"]);
  const filters: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    if (!systemKeys.has(key)) {
      if (filters[key]) {
        filters[key] = Array.isArray(filters[key])
          ? [...filters[key], value]
          : [filters[key] as string, value];
      } else {
        filters[key] = value;
      }
    }
  });

  try {
    const result = await getProducts({
      categorySlug,
      limit,
      offset,
      sort,
      q,
      filters,
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
