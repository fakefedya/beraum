import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const orderStatusEnum = pgEnum("order_status", [
  "new",
  "processing",
  "completed",
  "cancelled",
]);

export type OrderDeliveryDetails = {
  address?: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
  courierComment?: string;
};

export type OrderSnapshotItem = {
  uniqueSku: string;
  siteArticle: string;
  categoryName: string;
  price: number;
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: text("order_number")
      .default(sql`upper(substr(gen_random_uuid()::text, 1, 8))`)
      .notNull()
      .unique(),
    status: orderStatusEnum("status").default("new").notNull(),

    // Контакты
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    message: text("message"),

    // Детали доставки и оплаты
    deliveryMethod: text("delivery_method", {
      enum: ["pickup", "delivery"],
    }).notNull(),
    paymentMethod: text("payment_method", { enum: ["card", "cash"] }).notNull(),
    deliveryDetails: jsonb("delivery_details")
      .$type<OrderDeliveryDetails>()
      .default({})
      .notNull(),

    // Корзина и суммы
    items: jsonb("items").$type<OrderSnapshotItem[]>().notNull(),
    totalAmount: integer("total_amount").notNull(),

    // Security & Audit
    ipHash: text("ip_hash").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_orders_status").on(table.status),
    index("idx_orders_created_at").on(table.createdAt),
    index("idx_orders_number").on(table.orderNumber),
  ],
);
