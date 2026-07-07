import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { slideTypeEnum, slidePlacementEnum } from "./enums.schema";

// 1. Возвращаем типы для JSONB
export type SlideTagItem = {
  xPercent: number;
  yPercent: number;
  title: string;
  subtitle: string;
  href: string;
};

export type SlidePayload =
  | { tags: SlideTagItem[] }
  | { title: string; description: string; buttonText: string; href: string };

export const slides = pgTable("slides", {
  id: uuid("id").defaultRandom().primaryKey(),
  internalTitle: text("internal_title").notNull(),

  placement: slidePlacementEnum("placement").default("home_hero").notNull(),

  bucketName: text("bucket_name").notNull().default("system-assets"),
  fileKey: text("file_key").notNull(),
  mobileFileKey: text("mobile_file_key"),
  type: slideTypeEnum("type").notNull(),
  payload: jsonb("payload").$type<SlidePayload>().notNull(),

  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
