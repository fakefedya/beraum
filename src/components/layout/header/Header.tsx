import { ModeSection } from "./_components/ModeSection";
import { NavSection } from "./_components/NavSection";

export const Header = () => {
  return (
    <header className="fixed top-4 left-0 z-50 w-full px-4">
      <div className="bg-background shadow-nav transition-width relative flex w-full max-w-full justify-between gap-1.5 rounded-[20px] p-1.5 lg:mx-auto lg:w-fit lg:min-w-2xl">
        <ModeSection />
        <NavSection />
      </div>
    </header>
  );
};
