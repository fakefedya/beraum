"use client";

import { Icons } from "@/src/components/ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { useEffect, useRef, useState } from "react";

export const ModePill = () => {
  const pathname = usePathname();
  const isDiscount = pathname === "/discount";

  const [pillStyle, setPillStyle] = useState({ width: 0, left: 0, opacity: 0 });
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const updatePill = () => {
      if (activeRef.current) {
        setPillStyle({
          width: activeRef.current.offsetWidth,
          left: activeRef.current.offsetLeft,
          opacity: 1,
        });
      }
    };

    updatePill();

    window.addEventListener("resize", updatePill);
    return () => window.removeEventListener("resize", updatePill);
  }, [pathname]);

  return (
    <nav
      className="relative h-full w-fit"
      aria-label="Переключение режима магазина"
    >
      <div
        className={cn(
          "relative flex h-full items-center rounded-full p-1 backdrop-blur-2xl transition-colors duration-500 ease-out",
          isDiscount ? "bg-brand" : "bg-frosted-glass/40",
        )}
      >
        <div
          className={cn(
            "absolute top-1 bottom-1 left-0 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            isDiscount ? "bg-background" : "bg-brand",
          )}
          style={{
            width: `${pillStyle.width}px`,
            transform: `translateX(${pillStyle.left}px)`,
            opacity: pillStyle.opacity,
          }}
          aria-hidden="true"
        />
        <Link
          href="/"
          ref={!isDiscount ? activeRef : null}
          aria-label="Главная страница"
          aria-current={!isDiscount ? "page" : undefined}
          className={cn(
            "focus-visible:ring-foreground relative z-10 flex h-full items-center justify-center rounded-full px-3 transition-colors duration-300 focus-visible:outline-none xl:px-5",
            !isDiscount
              ? "text-foreground"
              : "text-brand-muted hover:text-foreground",
          )}
        >
          <Icons.logo className="h-4 w-fit fill-current stroke-current stroke-[0.25] [shape-rendering:crispEdges] xl:h-5" />
        </Link>
        <Link
          href="/discount"
          ref={isDiscount ? activeRef : null}
          aria-current={isDiscount ? "page" : undefined}
          className={cn(
            "relative z-10 flex h-full items-center justify-center rounded-full px-3 text-lg font-medium tracking-wide transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none xl:px-5",
            isDiscount
              ? "text-foreground"
              : "hover:text-foreground text-muted-foreground",
          )}
        >
          Дисконт
        </Link>
      </div>
    </nav>
  );
};
