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
  NavMenuDefault,
  NavMenuMega,
  NavExternal,
  NavLink,
} from "@/src/lib/constants";
import { Badge } from "@/src/components/ui/badge";

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
              return <MegaMenuNode key={key} item={link} />;
            case "default":
              return <DefaultMenuNode key={key} item={link} />;
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

const MegaMenuNode = ({ item }: { item: NavMenuMega }) => {
  const colCount = item.promoCards.length;

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="flex gap-8">
          <ul className="flex h-full min-w-fit flex-col">
            {item.sidebarLinks.map((link) => (
              <li key={link.href}>
                <NavigationMenuLink asChild className="flex-col-reverse">
                  <Link
                    href={link.href}
                    className="color-black transition-300 flex items-start gap-0 rounded-xl p-4 text-base font-medium hover:bg-gray-50"
                  >
                    {link.label}
                    {link.isNew && (
                      <span className="text-xs leading-1 font-medium text-[#ff6109]">
                        Новые модели
                      </span>
                    )}
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>

          <ul className="grid h-auto w-full grid-cols-3 gap-3">
            {item.promoCards.map((card) => (
              <li key={card.href} className={"min-h-full"}>
                <NavigationMenuLink asChild>
                  <Link
                    href={card.href}
                    className="relative flex h-full items-end rounded-xl bg-gray-50"
                  >
                    <div className="flex flex-col gap-0 p-4">
                      <span className="font-medium text-black">
                        {card.label}
                      </span>
                      <span className="text-black-muted">
                        {card.description}
                      </span>
                    </div>
                    {card.isNew && (
                      <Badge variant={"new"} className="absolute top-4 right-4">
                        Новинка
                      </Badge>
                    )}
                    <div className="absolute inset-0 z-0 flex items-end justify-end p-2 text-black opacity-20 transition-opacity group-hover:opacity-40"></div>
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};

const DefaultMenuNode = ({ item }: { item: NavMenuDefault }) => {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="flex w-[250px] flex-col gap-1 p-3">
          {item.items.map((subItem) => (
            <li key={subItem.href}>
              <NavigationMenuLink asChild>
                <Link
                  href={subItem.href}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-black/70 transition-colors outline-none hover:bg-slate-100 hover:text-black focus:bg-slate-100"
                >
                  {subItem.label}
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
