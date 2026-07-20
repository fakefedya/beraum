"use client";

import { Icons } from "@/src/components/ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { useEffect, useRef, useState } from "react";

export const ModeSection = () => {
  const pathname = usePathname();
  const isDiscount = pathname === "/discount";
  const [modeStyle, setModeStyle] = useState({ width: 0, left: 0, opacity: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const updateMode = () => {
      if (activeRef.current) {
        setModeStyle({
          width: activeRef.current.offsetWidth,
          left: activeRef.current.offsetLeft,
          opacity: 1,
        });
        setIsMounted(true);
      }
    };

    updateMode();
    window.addEventListener("resize", updateMode);

    return () => window.removeEventListener("resize", updateMode);
  }, [pathname]);

  return (
    <div
      className="relative h-full w-fit"
      aria-label="Переключение режима магазина"
    >
      <div
        className={cn(
          "bg-card relative flex h-12 items-center rounded-[16px] transition-colors duration-500 ease-out",
        )}
      >
        <div
          className={cn(
            "bg-brand-gradient absolute top-0 bottom-0 left-0 rounded-[14px]",
            isMounted
              ? "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              : "transition-none",
          )}
          style={{
            width: `${modeStyle.width}px`,
            transform: `translateX(${modeStyle.left}px)`,
            opacity: modeStyle.opacity,
          }}
          aria-hidden="true"
        />
        <Link
          href="/"
          ref={!isDiscount ? activeRef : null}
          aria-label="Главная страница"
          aria-current={!isDiscount ? "page" : undefined}
          className={cn(
            "relative z-10 flex h-full items-center justify-center rounded-[12px] px-3 transition-colors duration-300 xl:px-4",
            "focus-visible:ring-foreground focus-visible:outline-none",
            !isDiscount
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-background/25",
          )}
        >
          <Icons.logo className="h-4 w-fit fill-current stroke-current stroke-[0.25] [shape-rendering:crispEdges] xl:h-5" />
        </Link>
        <Link
          href="/discount"
          ref={isDiscount ? activeRef : null}
          aria-current={isDiscount ? "page" : undefined}
          className={cn(
            "relative z-10 flex h-full items-center justify-center rounded-[12px] px-3 font-semibold tracking-wide transition-colors duration-300 focus-visible:ring-2 xl:px-4",
            "focus-visible:ring-black focus-visible:outline-none",
            isDiscount
              ? "text-foreground hover:bg-background/25"
              : "hover:text-foreground text-muted-foreground",
          )}
        >
          Дисконт
        </Link>
      </div>
    </div>
  );
};
