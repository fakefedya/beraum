"use client";

import { NAV_LINKS } from "@/src/lib/constants/navigation";
import { usePathname } from "next/navigation";
import { NavDesktop } from "./NavDesktop";
import { NavExternalSection } from "./NavExternalSection";
import { NavMobile } from "./NavMobile";
import { SearchSection } from "./SearchSection";
import { MarketplaceDropdown } from "./MarketplaceDropdown";
import { NavigationMenu } from "@/src/components/ui/navigation-menu";
import { cn } from "@/src/lib/utils";

export const NavSection = () => {
  const pathname = usePathname();
  const isDiscount = pathname.startsWith("/discount");
  const links = isDiscount ? NAV_LINKS.discount : NAV_LINKS.store;

  return (
    <div
      className={cn(
        "flex w-full flex-row-reverse items-center justify-end gap-1.5",
        "lg:flex-row",
      )}
    >
      <NavigationMenu className="static flex gap-1.5 lg:mx-auto">
        <NavDesktop links={links} />
        <NavExternalSection links={links} />
      </NavigationMenu>
      <NavMobile links={links} />
      <SearchSection />
      <MarketplaceDropdown />
    </div>
  );
};
