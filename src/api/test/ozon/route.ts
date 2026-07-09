import { NextResponse } from "next/server";
import { serverEnv } from "@/src/lib/env/server";
import { getOzonStocksDryRun } from "@/src/server/services/ozon/client";

export async function GET(request: Request) {
  // 🛡 Security Check: Zero Trust (Защита от сканеров и ботов)
  const authHeader = request.headers.get("authorization");
  const expectedToken = `Bearer ${serverEnv.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    console.warn(
      "🚨 [API] Несанкционированная попытка доступа к тестовому роуту Ozon",
    );
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  // 🚀 Запускаем тестовый прогон
  const result = await getOzonStocksDryRun();

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
