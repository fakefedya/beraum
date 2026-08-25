import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const requestTypeEnum = pgEnum("request_type", [
  "consultation",
  "partnership",
  "support",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "new",
  "in_progress",
  "resolved",
]);

export const feedbackRequests = pgTable(
  "feedback_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: requestTypeEnum("type").notNull(),
    status: requestStatusEnum("status").default("new").notNull(),

    // Базовые поля для всех форм
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    message: text("message"),

    // Специфичные данные (ИНН, артикулы, маркетплейс)
    payload: jsonb("payload").default({}).notNull(),

    // Security & Analytics
    ipHash: text("ip_hash").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      typeIdx: index("idx_feedback_type").on(table.type),
      statusIdx: index("idx_feedback_status").on(table.status),
      createdAtIdx: index("idx_feedback_created_at").on(table.createdAt),
    };
  },
);

export const mediaUploads = pgTable("media_uploads", {
  fileKey: text("file_key").primaryKey(),
  bucket: text("bucket").notNull(),
  contentType: text("content_type").notNull(),
  ipHash: text("ip_hash").notNull(),
  claimedBy: uuid("claimed_by").references(() => feedbackRequests.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});
