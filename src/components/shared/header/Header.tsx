import { cn } from "@/src/lib/utils";
import { ModeSection } from "./_components/ModeSection";
import { NavSection } from "./_components/NavSection";

export const Header = () => {
  return (
    <header className={cn("fixed top-2 left-0 z-50 w-full px-4", "lg:top-4")}>
      <div
        className={cn(
          "bg-background shadow-nav transition-width relative flex w-full max-w-full justify-between gap-1 rounded-[20px] py-1 pr-4 pl-1",
          "lg:mx-auto lg:w-fit lg:min-w-3xl lg:p-1.5 xl:gap-1.5",
        )}
      >
        <ModeSection />
        <NavSection />
      </div>
    </header>
  );
};
