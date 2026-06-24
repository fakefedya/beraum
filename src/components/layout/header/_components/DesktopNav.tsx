"use client";

import * as React from "react";
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

// Типизируем пропсы, чтобы компонент был переиспользуемым
type NavLink = {
  label: string;
  href: string;
  isExternal: boolean;
};

export const DesktopNav = ({ links }: { links: readonly NavLink[] }) => {
  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList className="gap-1">
        {links.map((link) => {
          // 1. СПЕЦИАЛЬНЫЙ СЛУЧАЙ: Мега-меню для Каталога
          if (link.label === "Каталог") {
            return (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuTrigger className="h-9 rounded-full bg-transparent hover:bg-black/5 focus:bg-black/5 data-[state=open]:bg-black/5">
                  {link.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="from-brand/20 to-brand-dark/20 flex h-full w-full flex-col justify-end rounded-xl bg-gradient-to-br p-6 no-underline transition-shadow outline-none select-none hover:shadow-md focus:shadow-md"
                          href="/catalog/new"
                        >
                          <div className="mt-4 mb-2 text-lg font-bold text-black">
                            Новинки 2026
                          </div>
                          <p className="text-sm leading-tight text-black/70">
                            Индукционные панели с вытяжкой и умные духовые шкафы
                            Beraum.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/catalog/hobs" title="Варочные панели">
                      Газовые и индукционные.
                    </ListItem>
                    <ListItem href="/catalog/hoods" title="Вытяжки">
                      Островные и встраиваемые.
                    </ListItem>
                    <ListItem href="/catalog/ovens" title="Духовые шкафы">
                      С конвекцией и функцией СВЧ.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          // 2. ОБЫЧНЫЕ ССЫЛКИ
          return (
            <NavigationMenuItem key={link.href}>
              {link.isExternal ? (
                <NavigationMenuLink asChild>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "h-9 rounded-full bg-transparent hover:bg-black/5 focus:bg-black/5",
                    )}
                  >
                    {link.label}{" "}
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-50" />
                  </a>
                </NavigationMenuLink>
              ) : (
                <Link href={link.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "h-9 rounded-full bg-transparent hover:bg-black/5 focus:bg-black/5",
                    )}
                  >
                    {link.label}
                  </NavigationMenuLink>
                </Link>
              )}
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

// Вспомогательный компонент для пунктов выпадающего списка
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href!}
          ref={ref}
          className={cn(
            "block space-y-1 rounded-lg p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-slate-100 hover:text-black focus:bg-slate-100 focus:text-black",
            className,
          )}
          {...props}
        >
          <div className="text-sm leading-none font-bold">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-black/50">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem";
