"use client";

import { Icons } from "@/src/components/ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { useEffect, useRef, useState } from "react";

export const StoreMode = () => {
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
    <nav className="relative w-fit" aria-label="Переключение режима магазина">
      <div
        className={cn(
          "relative flex h-14 items-center rounded-full p-1 transition-colors duration-500 ease-out",
          isDiscount ? "bg-brand" : "bg-frost-glass",
        )}
      >
        <div
          className={cn(
            "absolute top-1 bottom-1 left-0 rounded-full bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            isDiscount ? "bg-white" : "bg-brand",
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
            "relative z-10 flex h-full items-center justify-center rounded-full px-5 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none",
            !isDiscount ? "text-black" : "text-black/50 hover:text-black/80",
          )}
        >
          <Icons.logo className="h-5 w-auto fill-current stroke-current stroke-[0.25] [shape-rendering:crispEdges]" />
        </Link>
        <Link
          href="/discount"
          ref={isDiscount ? activeRef : null}
          aria-current={isDiscount ? "page" : undefined}
          className={cn(
            "relative z-10 flex h-full items-center justify-center rounded-full px-5 text-lg font-bold tracking-wide transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none",
            isDiscount ? "text-black" : "text-black/50 hover:text-black/80",
          )}
        >
          Дисконт
        </Link>
      </div>
    </nav>
  );
};
