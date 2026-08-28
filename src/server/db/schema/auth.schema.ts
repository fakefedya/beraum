import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  primaryKey,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Строго типизированные роли (RBAC)
export const userRoleEnum = pgEnum("user_role", [
  "superadmin",
  "manager",
  "support",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  passwordHash: text("password_hash"), // Хэш Argon2/Bcrypt
  role: userRoleEnum("role").default("manager").notNull(),

  // 2FA Настройки
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false).notNull(),

  // Метаданные безопасности
  lastLoginIp: text("last_login_ip"),
  lastLoginAt: timestamp("last_login_at", { mode: "date" }),
  isLocked: boolean("is_locked").default(false).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

// Таблица сессий для Auth.js (Database Strategy)
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Таблица токенов 2FA (коды из email)
export const twoFactorTokens = pgTable(
  "two_factor_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
    attempts: integer("attempts").default(0).notNull(), // 🛡️ Защита от перебора
  },
  (table) => [
    {
      uniqueEmailToken: sql`UNIQUE (${table.email}, ${table.token})`,
    },
  ],
);
