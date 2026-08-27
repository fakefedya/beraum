import {
  LayoutDashboard,
  Inbox,
  Package,
  Image as ImageIcon,
  Settings,
} from "lucide-react";

export type Role = "superadmin" | "manager" | "support";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
};

export const DASHBOARD_NAV: DashboardNavItem[] = [
  {
    label: "Сводка",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["superadmin", "manager", "support"],
  },
  {
    label: "Заявки",
    href: "/dashboard/requests",
    icon: Inbox,
    roles: ["superadmin", "support"],
  },
  {
    label: "Товары",
    href: "/dashboard/products",
    icon: Package,
    roles: ["superadmin", "manager"],
  },
  {
    label: "Баннеры",
    href: "/dashboard/banners",
    icon: ImageIcon,
    roles: ["superadmin", "manager"],
  },
  {
    label: "Настройки",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["superadmin"],
  },
];
