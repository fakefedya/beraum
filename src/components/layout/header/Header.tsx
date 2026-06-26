import { NavPill } from "./_components/NavPill";
import { ModePill } from "./_components/ModePill";

export const Header = () => {
  return (
    <header className="sticky top-4 z-50 mx-auto h-14 w-full max-w-7xl px-4">
      <div className="flex h-full w-full items-center gap-3 sm:justify-between">
        <ModePill />
        <NavPill />
      </div>
    </header>
  );
};
