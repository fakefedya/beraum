// src/components/layout/header/_components/NavDesktop.tsx
"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { cn } from "@/src/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/src/components/ui/navigation-menu";
import type {
  NavItem,
  NavMenu,
  NavExternal,
  NavLink,
} from "@/src/lib/constants";

interface NavDesktopProps {
  links: readonly NavItem[];
}

export const NavDesktop = ({ links }: NavDesktopProps) => {
  if (!links || links.length === 0) return null;

  return (
    <NavigationMenu className="static hidden h-full max-w-full lg:flex">
      <NavigationMenuList className="h-full gap-8">
        {links.map((link, idx) => {
          const key = `nav-item-${idx}`;

          switch (link.type) {
            case "mega":
              return <MegaMenuNode key={key} item={link} colCount={4} />;
            case "default":
              return <MegaMenuNode key={key} item={link} colCount={3} />;
            case "link":
            case "external":
              return <LinkNode key={key} item={link} />;
            default: {
              const _exhaustiveCheck: never = link;
              return _exhaustiveCheck;
            }
          }
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const MegaMenuNode = ({
  item,
  colCount,
}: {
  item: NavMenu;
  colCount: number;
}) => {
  const isGrid = item.layout === "grid";

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="bg-transparent">
        {item.label}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul
          className={cn(
            isGrid
              ? `grid grid-cols-${colCount} gap-2`
              : "flex w-50 flex-col gap-1",
          )}
        >
          {item.items.map((subItem) => (
            <li key={subItem.href}>
              <NavigationMenuLink asChild>
                <Link href={subItem.href} className="relative flex-col gap-1">
                  <div className="flex aspect-3/2 items-center justify-center rounded-lg bg-slate-100 text-slate-400"></div>
                  <span className="absolute top-1 right-1">
                    {subItem.isNew ? "Новые модели" : ""}
                  </span>
                  <span className="absolute bottom-0 left-1">
                    {subItem.label}
                  </span>
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
  const isExternal = item.type === "external";
  const target = isExternal ? item.target || "_self" : undefined;
  const rel = target === "_blank" ? "noopener noreferrer" : undefined;

  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        {isExternal ? (
          <a
            href={item.href}
            target={target}
            rel={rel}
            className={cn(
              navigationMenuTriggerStyle(),
              "gap-1.5 bg-transparent",
            )}
          >
            {item.label} <ExternalLink className="size-3.5 opacity-50" />
          </a>
        ) : (
          <Link
            href={item.href}
            className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
          >
            {item.label}
          </Link>
        )}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};
