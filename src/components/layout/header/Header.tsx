import { NavPill } from "./_components/NavPill";
import { ModePill } from "./_components/ModePill";

export const Header = () => {
  return (
    <header className="sticky top-4 z-50 mx-auto h-12 w-full max-w-7xl px-4 xl:h-14">
      <div className="flex h-full w-full items-center justify-between gap-3">
        <ModePill />
        <NavPill />
      </div>
    </header>
  );
};
