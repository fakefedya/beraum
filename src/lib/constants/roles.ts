export const USER_ROLES = [
  "superadmin",
  "admin",
  "manager",
  "support",
] as const;

export type Role = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Суперадмин",
  admin: "Админ",
  manager: "Менеджер",
  support: "Поддержка",
};
