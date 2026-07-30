import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

export const marketplaceClicks = pgTable(
  "marketplace_clicks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    article: text("article").notNull(),
    marketplace: text("marketplace").notNull(),
    deviceId: uuid("device_id").notNull(),
    ipHash: text("ip_hash").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      articleIdx: index("idx_clicks_article").on(table.article),
      marketplaceIdx: index("idx_clicks_marketplace").on(table.marketplace),
      deviceIdIdx: index("idx_clicks_device_id").on(table.deviceId),
    };
  },
);
