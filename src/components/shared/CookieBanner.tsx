"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  const acceptCookies = () => {
    const maxAge = 60 * 60 * 24 * 365; // 1 год
    document.cookie = `beraum_cookie_consent=accepted; path=/; max-age=${maxAge}; SameSite=Lax; ${
      process.env.NODE_ENV === "production" ? "Secure" : ""
    }`;
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-50 w-fit -translate-x-1/2",
        "animate-in fade-in slide-in-from-bottom-10 duration-500 ease-out",
        "md:w-max",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-2",
          "bg-background/80 shadow-nav backdrop-blur-xl backdrop-saturate-150",
          "rounded-xl p-1.5",
          "md:flex-row md:rounded-[20px] md:p-1.5",
        )}
      >
        <div
          className={cn(
            "bg-card flex items-center rounded-[16px] p-4",
            "md:min-h-12 md:px-4 md:py-0",
          )}
        >
          <p className="text-foreground text-sm font-medium tracking-tight">
            Сайт использует файлы cookie.{" "}
            <Link
              href="/policies/privacy"
              className="text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              Подробнее
            </Link>
          </p>
        </div>

        <Button
          onClick={acceptCookies}
          className={cn(
            "bg-brand text-foreground h-12 w-full shrink-0 rounded-xl px-6 font-semibold",
            "hover:bg-brand/80 transition-all duration-300",
            "md:w-fit md:rounded-[16px]",
          )}
        >
          Хорошо
        </Button>
      </div>
    </div>
  );
};
