// src/server/db/client.ts
import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@/src/lib/env/server";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// 🛡️ Архитектурный фикс: Fallback для этапа Docker-сборки, когда ENV-переменные пустые
const connectionString = serverEnv.DATABASE_URL || "";

const conn =
  globalForDb.conn ??
  postgres(connectionString, {
    max: Number(process.env.DB_POOL_MAX ?? 10),
    idle_timeout: 20,
    connect_timeout: 10,
    // Безопасная проверка строки
    prepare: !connectionString.includes("pgbouncer"),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });
