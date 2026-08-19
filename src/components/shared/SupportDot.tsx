"use client";

import { cn } from "@/src/lib/utils";
import { useSupportStatus } from "@/src/hooks/use-support-status";

interface SupportDotProps {
  className?: string; // Позволит управлять размером из родительских компонентов
}

export const SupportDot = ({ className }: SupportDotProps) => {
  const { isOpen, isMounted } = useSupportStatus();

  // Защита от Hydration Mismatch: до монтирования на клиенте отдаем серую заглушку
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
      <span className="bg-destructive relative inline-flex h-full w-full rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
    </span>
  );
};
