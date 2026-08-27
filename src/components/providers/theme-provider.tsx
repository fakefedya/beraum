"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <NextThemesProvider
      {...props}
      forcedTheme={isDashboard ? undefined : "light"}
    >
      {children}
    </NextThemesProvider>
  );
}
