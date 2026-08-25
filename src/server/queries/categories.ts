import "server-only";

import { asc } from "drizzle-orm";
import { db } from "@/src/server/db/client";
import { categories } from "@/src/server/db/schema";

export async function getCategoriesList() {
  try {
    const data = await db
      .select({
        id: categories.id,
        name: categories.titleRu,
      })
      .from(categories)
      .orderBy(asc(categories.titleRu));

    return { success: true, data };
  } catch (error) {
    console.error("❌ Ошибка Server Action (getCategoriesList):", error);
    return { success: false, data: [] };
  }
}
