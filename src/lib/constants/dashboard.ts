import {
  Inbox,
  Package,
  Percent,
  Image as ImageIcon,
  Settings,
  ChartBar,
  ShoppingCart,
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
    roles: ["superadmin", "admin", "manager", "support", "warehouse"],
  },
  {
    label: "Заявки",
    href: "/dashboard/requests",
    icon: Inbox,
    roles: ["superadmin", "admin", "support"],
  },
  {
    label: "Заказы",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    roles: ["superadmin", "admin", "support"],
  },
  {
    label: "Товары",
    href: "/dashboard/products",
    icon: Package,
    roles: ["superadmin", "admin", "manager"],
  },
  {
    label: "Дисконт товары",
    href: "/dashboard/discount-products",
    icon: Percent,
    roles: ["superadmin", "admin", "manager", "warehouse", "support"],
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
