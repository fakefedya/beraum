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
  NavMenuDefault,
  NavMenuMega,
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
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="bg-transparent">
        {item.label}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        {/* CSS Grid разделяет контейнер: 250px на сайдбар, остальное на карточки */}
        <div className="grid w-[800px] grid-cols-[220px_1fr] gap-6 p-6 lg:w-[960px]">
          {/* ЛЕВАЯ КОЛОНКА (Сайдбар со ссылками) */}
          <ul className="flex flex-col gap-1 border-r border-slate-100 pr-4">
            {item.sidebarLinks.map((link) => (
              <li key={link.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={link.href}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-black/70 transition-colors outline-none hover:bg-slate-100 hover:text-black focus:bg-slate-100 focus:text-black"
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>

          {/* ПРАВАЯ КОЛОНКА (Сетка с промо-карточками) */}
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {item.promoCards.map((card) => (
              <li
                key={card.href}
                className={cn(
                  "relative",
                  card.label === "Без отделки" && "row-span-2",
                )}
              >
                <NavigationMenuLink asChild>
                  <Link
                    href={card.href}
                    className="group relative flex h-full min-h-[140px] w-full flex-col overflow-hidden rounded-xl bg-slate-100 p-4 transition-all outline-none hover:shadow-md focus:ring-2 focus:ring-black"
                  >
                    <span className="relative z-10 max-w-[80%] text-sm leading-tight font-bold text-black">
                      {card.label}
                    </span>

                    {card.isNew && (
                      <span className="bg-brand absolute top-4 right-4 z-10 flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-bold tracking-wider text-black uppercase">
                        New
                      </span>
                    )}

                    {/* Заглушка под картинку. Когда будут реальные изображения - используй next/image */}
                    <div className="absolute inset-0 z-0 flex items-end justify-end p-2 text-black opacity-20 transition-opacity group-hover:opacity-40">
                      {card.imagePlaceholder}
                    </div>
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
      <NavigationMenuTrigger className="bg-transparent">
        {item.label}
      </NavigationMenuTrigger>
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
