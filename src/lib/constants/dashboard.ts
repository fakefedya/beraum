import {
  Inbox,
  Package,
  Image as ImageIcon,
  Settings,
  ChartBar,
} from "lucide-react";

import type { Role } from "@/src/lib/constants/roles";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
};

export const DASHBOARD_NAV: DashboardNavItem[] = [
  {
    label: "Статистика",
    href: "/dashboard",
    icon: ChartBar,
    roles: ["superadmin", "admin", "manager", "support"],
  },
  {
    label: "Заявки",
    href: "/dashboard/requests",
    icon: Inbox,
    roles: ["superadmin", "admin", "support"],
  },
  {
    label: "Товары",
    href: "/dashboard/products",
    icon: Package,
    roles: ["superadmin", "admin", "manager"],
  },
  {
    label: "Баннеры",
    href: "/dashboard/banners",
    icon: ImageIcon,
    roles: ["superadmin", "admin", "manager"],
  },
  {
    label: "Настройки",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["superadmin"],
  },
];
