"use client";

import { cn } from "@/src/lib/utils";
import { useSupportStatus } from "@/src/hooks/use-support-status";
import { Badge } from "../ui/badge";

interface SupportDotProps {
  className?: string;
}

export const SupportStatus = ({ className }: SupportDotProps) => {
  const { isOpen, isMounted } = useSupportStatus();

  if (!isMounted) {
    return (
      <span className={cn("relative flex shrink-0", className)}>
        <span className="bg-muted/40 relative inline-flex h-full w-full rounded-full" />
      </span>
    );
  }

  // Рабочее время
  if (isOpen) {
    return (
      <span className={cn("relative flex shrink-0", className)}>
        <span className="bg-brand-secondary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
        <span className="bg-brand-secondary relative inline-flex h-full w-full rounded-full" />
      </span>
    );
  }

  // Нерабочее время (Красный цвет, без анимации)
  return (
    <span className={cn("relative flex shrink-0", className)}>
      <span className="absolute inline-flex">
        <Badge className="bg-red-100 font-medium tracking-normal text-red-700 uppercase">
          Офлайн
        </Badge>
      </span>
    </span>
  );
};
