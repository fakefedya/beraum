"use client";

import { Icons } from "@/src/components/ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { useEffect, useRef, useState } from "react";

export const ModeSection = () => {
  const pathname = usePathname();
  const isDiscount = pathname.startsWith("/discount");

  const [modeStyle, setModeStyle] = useState({ width: 0, left: 0, opacity: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = activeRef.current;
    if (!el) return;

    const updateMode = () => {
      if (el.offsetWidth === 0) return;

      setModeStyle({
        width: el.offsetWidth,
        left: el.offsetLeft,
        opacity: 1,
      });
      setIsMounted(true);
    };

    updateMode();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updateMode);
    });
    observer.observe(el);

    const interval = setInterval(updateMode, 50);
    const timeout = setTimeout(() => clearInterval(interval), 1500);

    window.addEventListener("resize", updateMode);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener("resize", updateMode);
    };
  }, [pathname]);

  return (
    <div
      className="relative h-full w-fit"
      aria-label="Переключение режима магазина"
    >
      <div
        className={cn(
          "bg-card relative flex h-11 items-center rounded-[10px]",
          "transition-colors duration-500 ease-out",
          "md:h-12 md:rounded-[16px]",
        )}
      >
        <div
          className={cn(
            "bg-brand absolute top-0 bottom-0 left-0 rounded-lg",
            "md:rounded-[16px]",
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
          aria-label="Каталог дисконта"
          aria-current={!isDiscount ? "page" : undefined}
          className={cn(
            "relative z-10 flex h-full items-center justify-center rounded-lg px-4",
            "focus-visible:ring-foreground focus-visible:outline-none",
            "transition-colors duration-300",
            "md:rounded-[16px]",
            !isDiscount
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-background/25",
          )}
        >
          <Icons.logo
            className={cn(
              "h-4 w-fit fill-current stroke-current stroke-[0.25] [shape-rendering:crispEdges]",
              "md:h-5",
            )}
          />
        </Link>
        <Link
          href="/discount/catalog"
          ref={isDiscount ? activeRef : null}
          aria-current={isDiscount ? "page" : undefined}
          className={cn(
            "relative z-10 flex h-full items-center justify-center rounded-lg px-4 text-base font-semibold",
            "focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none",
            "transition-colors duration-300",
            "md:rounded-[16px] md:text-lg",
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
