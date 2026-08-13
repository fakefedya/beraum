"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { cn } from "@/src/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          // Базовые стили для ВСЕХ тостов
          toast: cn(
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground",
            "group-[.toaster]:border-border group-[.toaster]:shadow-card",
            "rounded-xl p-4 font-sans text-base shadow-nav",
          ),
          description: "group-[.toast]:text-muted-foreground text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium rounded-lg px-3 py-1.5",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium rounded-lg px-3 py-1.5",

          // Кастомные состояния, заменяющие richColors
          error: cn(
            "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-600",
            "group-[.toaster]:border-red-200 dark:group-[.toaster]:bg-red-950/50 dark:group-[.toaster]:border-red-900",
            "[&_[data-icon]]:text-red-600", // Окрашиваем SVG-иконку
          ),
          success: cn(
            "group-[.toaster]:bg-green-50 group-[.toaster]:text-green-600",
            "group-[.toaster]:border-green-200 dark:group-[.toaster]:bg-green-950/50 dark:group-[.toaster]:border-green-900",
            "[&_[data-icon]]:text-green-600",
          ),
          warning: cn(
            "group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-600",
            "group-[.toaster]:border-yellow-200 dark:group-[.toaster]:bg-yellow-950/50 dark:group-[.toaster]:border-yellow-900",
            "[&_[data-icon]]:text-yellow-600",
          ),
          info: cn(
            "group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-600",
            "group-[.toaster]:border-blue-200 dark:group-[.toaster]:bg-blue-950/50 dark:group-[.toaster]:border-blue-900",
            "[&_[data-icon]]:text-blue-600",
          ),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
