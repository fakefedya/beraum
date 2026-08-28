import "server-only";
import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { desc, eq, and, ilike, or, count, type SQL } from "drizzle-orm";

export type RequestType =
  "all" | "consultation" | "partnership" | "support" | "wholesale";
export type RequestStatus = "all" | "new" | "in_progress" | "resolved";

export async function getFeedbackRequests(
  filterType: RequestType = "all",
  filterStatus: RequestStatus = "all",
  searchQuery: string = "",
  limit: number = 25,
  offset: number = 0,
) {
  try {
    const filters: (SQL | undefined)[] = [];

    if (filterType !== "all") {
      filters.push(eq(feedbackRequests.type, filterType));
    }
    if (filterStatus !== "all") {
      filters.push(eq(feedbackRequests.status, filterStatus));
    }

    if (searchQuery.trim()) {
      const q = `%${searchQuery.trim()}%`;
      filters.push(
        or(
          ilike(feedbackRequests.ticketNumber, q),
          ilike(feedbackRequests.email, q),
        ),
      );
    }

    const finalCondition = filters.length > 0 ? and(...filters) : undefined;

    const [data, [{ totalCount }]] = await Promise.all([
      db
        .select()
        .from(feedbackRequests)
        .where(finalCondition)
        .orderBy(desc(feedbackRequests.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ totalCount: count() })
        .from(feedbackRequests)
        .where(finalCondition),
    ]);

    return { success: true, data, totalCount };
  } catch (error) {
    console.error("❌ [DAL] Ошибка получения заявок:", error);
    return { success: false, data: [], totalCount: 0 };
  }
}
