import { NextRequest, NextResponse } from "next/server";
import { getActiveSlides } from "@/src/server/queries/banners";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get("placement") || "home_hero";

  if (placement !== "home_hero" && placement !== "catalog_hero") {
    return NextResponse.json(
      { success: false, data: [], error: "Invalid placement" },
      { status: 400 },
    );
  }

  try {
    const result = await getActiveSlides(placement);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Ошибка API /api/banners:", error);
    return NextResponse.json(
      { success: false, data: [], error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
