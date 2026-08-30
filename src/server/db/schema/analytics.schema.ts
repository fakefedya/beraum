import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const marketplaceClicks = pgTable(
  "marketplace_clicks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    article: text("article").notNull(),
    marketplace: text("marketplace").notNull(),
    source: text("source").default("unknown").notNull(),
    deviceType: text("device_type", { enum: ["mobile", "desktop", "unknown"] })
      .default("unknown")
      .notNull(),
    deviceId: uuid("device_id").notNull(),
    ipHash: text("ip_hash").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_clicks_article").on(table.article),
    index("idx_clicks_marketplace").on(table.marketplace),
    index("idx_clicks_device_id").on(table.deviceId),
    index("idx_clicks_created_at").on(table.createdAt),
    index("idx_clicks_article_date").on(table.article, table.createdAt),
  ],
);

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
