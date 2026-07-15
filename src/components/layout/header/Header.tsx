// src/components/layout/header/Header.tsx
import { NavigationMenu } from "@/src/components/ui/navigation-menu";
import { NavPill } from "./_components/NavPill";
import { ModePill } from "./_components/ModePill";

export const Header = () => {
  return (
    <header className="fixed top-4 left-0 z-50 w-full">
      <NavigationMenu className="mx-auto flex h-12 w-full max-w-360 items-center justify-between gap-3 px-4 xl:h-14">
        <ModePill />
        <NavPill />
      </NavigationMenu>
    </header>
  );
};
