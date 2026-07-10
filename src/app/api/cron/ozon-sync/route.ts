import { NextResponse } from "next/server";
import { serverEnv } from "@/src/lib/env/server";
import { syncOzonStocks } from "@/src/server/services/ozon/client";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = `Bearer ${serverEnv.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const result = await syncOzonStocks({ debug: false, dryRun: false });

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
