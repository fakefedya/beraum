import "server-only";
import { db } from "@/src/server/db/client";
import { orders } from "@/src/server/db/schema/orders.schema";
import { desc, count, or, ilike, eq, and, type SQL } from "drizzle-orm";

export async function getAdminOrders(
  page = 1,
  query = "",
  status = "all",
  limit = 25,
) {
  const offset = (page - 1) * limit;
  const filters: (SQL | undefined)[] = [];

  if (status !== "all") {
    filters.push(
      eq(
        orders.status,
        status as "new" | "processing" | "completed" | "cancelled",
      ),
    );
  }

  if (query) {
    const q = `%${query.trim()}%`;
    filters.push(
      or(
        ilike(orders.orderNumber, q),
        ilike(orders.email, q),
        ilike(orders.phone, q),
      ),
    );
  }

  const finalCondition = filters.length > 0 ? and(...filters) : undefined;

  const [data, [{ totalCount }]] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(finalCondition)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ totalCount: count() }).from(orders).where(finalCondition),
  ]);

  return { data, totalCount, hasMore: offset + limit < totalCount };
}
