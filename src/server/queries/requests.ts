import "server-only";
import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { desc, eq, and, ilike, or, type SQL } from "drizzle-orm";

export type RequestType =
  "all" | "consultation" | "partnership" | "support" | "wholesale";
export type RequestStatus = "all" | "new" | "in_progress" | "resolved";

export async function getFeedbackRequests(
  filterType: RequestType = "all",
  filterStatus: RequestStatus = "all",
  searchQuery: string = "", // 🛡️ Новый параметр
) {
  try {
    const filters: SQL[] = [];

    if (filterType !== "all") {
      filters.push(eq(feedbackRequests.type, filterType));
    }
    if (filterStatus !== "all") {
      filters.push(eq(feedbackRequests.status, filterStatus));
    }

    // 🛡️ Security: Поиск строго через параметризованный ilike
    if (searchQuery.trim()) {
      const q = `%${searchQuery.trim()}%`;
      filters.push(
        or(
          ilike(feedbackRequests.ticketNumber, q),
          ilike(feedbackRequests.email, q),
        ),
      );
    }

    const query = db
      .select()
      .from(feedbackRequests)
      .orderBy(desc(feedbackRequests.createdAt));

    if (filters.length > 0) {
      query.where(and(...filters));
    }

    const data = await query;
    return { success: true, data };
  } catch (error) {
    console.error("❌ [DAL] Ошибка получения заявок:", error);
    return { success: false, data: [] };
  }
}
