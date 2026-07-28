import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    titleRu: text("title_ru").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // 🛡 Индекс для быстрого ILIKE поиска по названию категории
      titleTrgmIdx: index("idx_categories_title_trgm").using(
        "gin",
        sql`${table.titleRu} gin_trgm_ops`,
      ),
    };
  },
);
