import { NextRequest, NextResponse } from "next/server";
import { getSupportModelsByCategory } from "@/src/server/queries/products";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  if (!categoryId) {
    return NextResponse.json(
      { success: false, data: [], error: "Missing categoryId" },
      { status: 400 },
    );
  }

  try {
    const result = await getSupportModelsByCategory(categoryId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Ошибка API /api/products/models:", error);
    return NextResponse.json(
      { success: false, data: [], error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
