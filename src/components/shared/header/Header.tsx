import { cn } from "@/src/lib/utils";
import { ModeSection } from "./_components/ModeSection";
import { NavSection } from "./_components/NavSection";

export const Header = () => {
  return (
    <header className={cn("fixed top-4 left-0 z-50 w-full px-4", "md:px-6")}>
      <div
        className={cn(
          "bg-background/80 shadow-nav transition-width relative flex w-full max-w-full justify-between gap-3 rounded-xl py-1 pr-4 pl-1 backdrop-blur-xl backdrop-saturate-150",
          "md:gap-2 md:rounded-[20px] md:p-1.5",
          "lg:mx-auto lg:w-fit",
        )}
      >
        <ModeSection />
        <NavSection />
      </div>
    </header>
  );
};
