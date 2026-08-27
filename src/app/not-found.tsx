import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8 flex h-40 w-64 items-center justify-center md:h-48 md:w-80">
        <svg
          viewBox="0 0 100 100"
          className="text-border absolute left-4 h-24 w-24 md:h-32 md:w-32"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="10" y="10" width="80" height="80" rx="20" />
          <circle cx="50" cy="50" r="24" />
          <circle cx="36" cy="50" r="4" fill="currentColor" stroke="none" />
          <circle cx="64" cy="50" r="4" fill="currentColor" stroke="none" />
        </svg>

        <svg
          viewBox="0 0 120 100"
          className={cn(
            "text-muted-foreground absolute right-0 h-24 w-32 md:h-32 md:w-40",
            "animate-[bounce_4s_ease-in-out_infinite]",
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M80 50 Q 100 50, 110 90" />
          <rect x="30" y="25" width="50" height="50" rx="12" />
          <path d="M30 38H10M30 62H10" />
        </svg>
      </div>

      <h1 className="text-foreground text-4xl font-bold md:text-5xl lg:text-8xl">
        404
      </h1>
      <h2 className="text-foreground mt-4 text-xl font-medium md:text-2xl">
        Связь потеряна
      </h2>
      <p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed md:text-lg">
        Кажется, эту страницу отключили от сети. Она была удалена, перемещена
        или никогда не существовала.
      </p>

      <Button
        asChild
        className="bg-brand text-foreground hover:bg-brand/80 mt-10 h-12 rounded-[16px] px-8 text-base font-medium shadow-sm transition-all hover:scale-105"
      >
        <Link href="/catalog/hob">Перейти в каталог</Link>
      </Button>
    </div>
  );
}
