"use client";

import Link from "next/link";
import { cn } from "@/src/lib/utils";

interface DiscountToggleProps {
  currentMode: "retail" | "wholesale";
}

export const DiscountToggle = ({ currentMode }: DiscountToggleProps) => {
  const handleScrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.7, // 70% высоты экрана (чуть выше контента)
      behavior: "smooth",
    });
  };

  return (
    <div
      className={cn(
        "bg-background/80 shadow-nav flex w-fit flex-wrap gap-2 p-1",
        "border border-black/5 backdrop-blur-xl backdrop-saturate-150",
        "rounded-2xl md:rounded-[20px]",
      )}
    >
      <Link
        href="?mode=retail"
        scroll={false}
        onClick={handleScrollToContent}
        className={cn(
          "rounded-xl px-8 py-3 text-base font-medium transition-all duration-300 outline-none",
          "focus-visible:ring-ring/50 focus-visible:ring-2",
          "md:rounded-[16px]",
          currentMode === "retail"
            ? "bg-brand text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-black/5",
        )}
      >
        Розница
      </Link>

      <Link
        href="?mode=wholesale"
        scroll={false}
        onClick={handleScrollToContent}
        className={cn(
          "rounded-xl px-8 py-3 text-base font-medium transition-all duration-300 outline-none",
          "focus-visible:ring-ring/50 focus-visible:ring-2",
          "md:rounded-[16px]",
          currentMode === "wholesale"
            ? "bg-brand text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-black/5",
        )}
      >
        Опт
      </Link>
    </div>
  );
};
