import { NextResponse } from "next/server";
import { serverEnv } from "@/src/lib/env/server";
import { syncWbStocks } from "@/src/server/services/wb/client";
import { syncWbPrices } from "@/src/server/services/wb/client";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  // Запускаем безопасный тест (dryRun: true)
  // const result = await syncWbStocks({ debug: true, dryRun: true });
  const result = await syncWbPrices({ debug: true, dryRun: false });

  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
