"use client";

import Link from "next/link";

import Image from "next/image";
import { cn } from "@/src/lib/utils";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/src/components/ui/navigation-menu";
import type {
  NavItem,
  NavMenuDefault,
  NavMenuMega,
  NavExternal,
  NavLink,
} from "@/src/lib/constants";
import { Badge } from "@/src/components/ui/badge";
import { STORAGE_URL, SYSTEM_ASSETS } from "@/src/lib/constants";

interface NavDesktopProps {
  links: readonly NavItem[];
}

export const NavDesktop = ({ links }: NavDesktopProps) => {
  if (!links || links.length === 0) return null;
  const internalLinks = links.filter((link) => link.type !== "external");

  return (
    <NavigationMenuList
      className={cn(
        "bg-brand-gradient-muted hidden h-12 w-fit items-center gap-0 rounded-[16px] p-1",
        "lg:flex",
      )}
    >
      {internalLinks.map((link, idx) => {
        const key = `nav-item-${idx}`;

        switch (link.type) {
          case "mega":
            return <MegaMenuNode key={key} item={link} />;
          case "default":
            return <DefaultMenuNode key={key} item={link} />;
          case "link":
            return <LinkNode key={key} item={link} />;
          default: {
            const _exhaustiveCheck: never = link;
            return _exhaustiveCheck;
          }
        }
      })}
    </NavigationMenuList>
  );
};

const MegaMenuNode = ({ item }: { item: NavMenuMega }) => {
  return (
    <NavigationMenuItem className="flex h-full items-center">
      <NavigationMenuTrigger
        className={cn(
          "text-foreground h-full rounded-[12px] px-2 font-medium tracking-tight transition-colors duration-300",
          "hover:bg-background/80",
          "data-[state=open]:bg-background",
          "xl:px-4",
        )}
      >
        {item.label}
      </NavigationMenuTrigger>
      <NavigationMenuContent className="p-5">
        <div className="flex gap-8">
          <ul className="flex h-full min-w-fit flex-col">
            {item.sidebarLinks.map((link) => (
              <li key={link.href}>
                <NavigationMenuLink asChild className="flex-col-reverse">
                  <Link
                    prefetch={false}
                    href={link.href}
                    className={cn(
                      "flex items-start gap-0 rounded-xl p-4 font-medium transition-colors duration-300",
                      "hover:bg-hover-background/80",
                      "data-[state=open]:bg-background",
                    )}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>

          <ul className="grid h-auto w-full grid-cols-2 gap-3">
            {item.promoCards.map((card) => {
              const imageUrl = card.cover
                ? `${STORAGE_URL}/${card.cover}`
                : SYSTEM_ASSETS.placeholder;

              return (
                <li key={card.href} className="min-h-full">
                  <NavigationMenuLink asChild>
                    <Link
                      prefetch={false}
                      href={card.href}
                      className={cn(
                        "group bg-card relative flex h-full flex-col gap-4 overflow-hidden rounded-xl border-2 border-transparent",
                        "hover:border-brand transition-colors duration-300",
                        "outline-none focus-visible:ring-2 focus-visible:ring-black",
                      )}
                    >
                      <div className="bg-accent relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-lg">
                        <Image
                          src={imageUrl}
                          alt={card.description}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className={cn(
                            "object-cover",
                            "transition-transform duration-500 group-hover:scale-105",
                          )}
                        />
                      </div>

                      <div className="bg-background/80 shadow-nav absolute bottom-4 left-4 flex w-fit flex-col gap-0 rounded-[12px] px-4 py-1.5 backdrop-blur-xl backdrop-saturate-150">
                        <span className="line-clamp-1 font-medium tracking-tight">
                          {card.label}
                        </span>
                        <span className="text-muted-foreground line-clamp-2 text-sm tracking-tight">
                          {card.description}
                        </span>
                      </div>

                      {card.isNew && (
                        <Badge className="bg-brand text-foreground absolute top-4 right-4 font-medium uppercase">
                          Новинка
                        </Badge>
                      )}
                    </Link>
                  </NavigationMenuLink>
                </li>
              );
            })}
          </ul>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};

const DefaultMenuNode = ({ item }: { item: NavMenuDefault }) => {
  const gridColumnCount = item.items.length;
  const columnsMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
  };

  const gridClass = columnsMap[gridColumnCount] || "grid-cols-3";

  return (
    <NavigationMenuItem className="flex h-full items-center">
      <NavigationMenuTrigger
        className={cn(
          "text-foreground h-full rounded-[12px] px-2 font-medium",
          "hover:bg-background/80",
          "data-[state=open]:bg-background",
          "xl:px-4",
        )}
      >
        {item.label}
      </NavigationMenuTrigger>
      <NavigationMenuContent className="p-5">
        <ul className={cn("grid h-full min-w-fit gap-3", gridClass)}>
          {item.items.map((subItem) => (
            <li key={subItem.href} className={"h-full min-h-95"}>
              <NavigationMenuLink asChild>
                <Link
                  prefetch={false}
                  href={subItem.href}
                  className={cn(
                    "relative flex h-full items-start rounded-xl border-2 border-transparent duration-300",
                    "bg-card hover:border-brand transition-colors",
                  )}
                >
                  <div className="flex flex-col gap-0 p-4">
                    <span className="font-medium">{subItem.label}</span>
                  </div>
                </Link>
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};

const LinkNode = ({ item }: { item: NavLink | NavExternal }) => {
  return (
    <NavigationMenuItem className="flex h-full items-center">
      <NavigationMenuLink asChild>
        <Link
          prefetch={false}
          href={item.href}
          className={cn(
            navigationMenuTriggerStyle(),
            "text-foreground h-full rounded-[12px] px-2 font-medium",
            "hover:bg-background/80",
            "xl:px-4",
          )}
        >
          {item.label}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};
