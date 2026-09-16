"use client";

import useSWR from "swr";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface NavBadgeProps {
  href: string;
}

export const NavBadge = ({ href }: NavBadgeProps) => {
  // Опрашиваем сервер каждые 15 секунд. Если вкладка неактивна, SWR автоматически ставит паузу.
  const { data } = useSWR("/api/dashboard/badges", fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: true,
  });

  if (!data || !data.success) return null;

  let badgeCount = 0;

  if (href === "/dashboard/requests") {
    badgeCount = data.data.newRequests;
  } else if (href === "/dashboard/orders") {
    badgeCount = data.data.newOrders;
  }

  if (badgeCount === 0) return null;

  return (
    <Badge
      className={cn(
        "bg-brand ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
        "animate-in fade-in zoom-in duration-300",
      )}
    >
      {badgeCount > 99 ? "99+" : badgeCount}
    </Badge>
  );
};
