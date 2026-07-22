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
          "bg-card relative flex h-11 items-center rounded-[16px]",
          "transition-colors duration-500 ease-out",
          "lg:h-12",
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
            "relative z-10 flex h-full items-center justify-center rounded-[12px] px-2",
            "focus-visible:ring-foreground focus-visible:outline-none",
            "transition-colors duration-300",
            "xl:px-4",
            !isDiscount
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-background/25",
          )}
        >
          <Icons.logo
            className={cn(
              "h-4 w-fit fill-current stroke-current stroke-[0.25] [shape-rendering:crispEdges]",
              "xl:h-5",
            )}
          />
        </Link>
        <Link
          href="/discount"
          ref={isDiscount ? activeRef : null}
          aria-current={isDiscount ? "page" : undefined}
          className={cn(
            "relative z-10 flex h-full items-center justify-center rounded-[12px] px-2 text-base font-semibold tracking-wide",
            "focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none",
            "transition-colors duration-300",
            "lg:text-lg xl:px-4",
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
