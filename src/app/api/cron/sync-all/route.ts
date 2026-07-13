import { NextResponse } from "next/server";
import { serverEnv } from "@/src/lib/env/server";
import { syncOzonStocks } from "@/src/server/services/ozon/client";
import { syncWbStocks, syncWbPrices } from "@/src/server/services/wb/client";

type SyncTaskResult = {
  success: boolean;
  synced?: number;
  error?: string;
  data?: unknown[];
};

type SyncTasks = "ozonStocks" | "wbStocks" | "wbPrices";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const debug = searchParams.get("debug") === "true";
  const dryRun = searchParams.get("dryRun") === "true";

  if (debug) {
    console.log(`\n=========================================`);
    console.log(`🤖 СТАРТ ОРКЕСТРАТОРА (DryRun: ${dryRun})`);
    console.log(`=========================================\n`);
  }

  const startTime = performance.now();
  const results: Record<SyncTasks, SyncTaskResult> = {
    ozonStocks: { success: false, synced: 0 },
    wbStocks: { success: false, synced: 0 },
    wbPrices: { success: false, synced: 0 },
  };

  try {
    if (debug) console.log("⏳ [1/3] Запуск синхронизации остатков Ozon...");
    results.ozonStocks = await syncOzonStocks({ debug, dryRun });

    if (debug)
      console.log("\n⏳ [2/3] Запуск синхронизации остатков Wildberries...");
    results.wbStocks = await syncWbStocks({ debug, dryRun });

    if (debug)
      console.log("\n⏳ [3/3] Запуск синхронизации цен Wildberries...");
    results.wbPrices = await syncWbPrices({ debug, dryRun });

    const endTime = performance.now();
    const executionTimeMs = Math.round(endTime - startTime);

    if (debug) {
      console.log(`\n=========================================`);
      console.log(`✅ ОРКЕСТРАТОР УСПЕШНО ЗАВЕРШИЛ РАБОТУ`);
      console.log(`⏱ Время выполнения: ${executionTimeMs} мс`);
      console.log(`=========================================\n`);
    }

    const hasErrors = Object.values(results).some((r) => !r.success);
    const statusCode = hasErrors ? 207 : 200;

    return NextResponse.json(
      {
        success: !hasErrors,
        executionTimeMs,
        tasks: results,
      },
      { status: statusCode },
    );
  } catch (error) {
    console.error("❌ Критическая ошибка оркестратора:", error);
    return NextResponse.json(
      { success: false, error: "Orchestrator failed to complete" },
      { status: 500 },
    );
  }
}
