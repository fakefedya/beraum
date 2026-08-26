// src/server/db/client.ts
import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@/src/lib/env/server";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn =
  globalForDb.conn ??
  postgres(serverEnv.DATABASE_URL, {
    max: Number(process.env.DB_POOL_MAX ?? 10), // Максимум соединений в пуле
    idle_timeout: 20, // Закрывать простаивающие соединения через 20 секунд
    connect_timeout: 10, // Таймаут подключения (сек) — быстрый отказ при падении БД
    prepare: !serverEnv.DATABASE_URL.includes("pgbouncer"),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });
