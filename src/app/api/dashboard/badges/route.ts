import { NextResponse } from "next/server";
import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { orders } from "@/src/server/db/schema/orders.schema";
import { count, eq } from "drizzle-orm";
import { auth } from "@/src/lib/auth/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    // Security: Отдаем метрики только авторизованным сотрудникам
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Оптимизация: Параллельный подсчет средствами СУБД
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
    console.error("❌ Ошибка API /api/dashboard/badges:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
