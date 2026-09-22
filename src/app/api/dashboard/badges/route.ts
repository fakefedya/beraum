import { NextResponse } from "next/server";
import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { orders } from "@/src/server/db/schema/orders.schema";
import { count, eq } from "drizzle-orm";
import { requireAuthRole } from "@/src/server/utils/auth-check";
import { USER_ROLES } from "@/src/lib/constants/roles";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAuthRole([...USER_ROLES]);

    const [[{ newRequests }], [{ newOrders }]] = await Promise.all([
      db
        .select({ newRequests: count() })
        .from(feedbackRequests)
        .where(eq(feedbackRequests.status, "new")),
      db
        .select({ newOrders: count() })
        .from(orders)
        .where(eq(orders.status, "new")),
    ]);

    return NextResponse.json({
      success: true,
      data: { newRequests, newOrders },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("UNAUTHORIZED") ||
        error.message.includes("FORBIDDEN"))
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    console.error("❌ Ошибка API /api/dashboard/badges:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
