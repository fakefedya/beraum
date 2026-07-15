"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

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

interface NavDesktopProps {
  links: readonly NavItem[];
}

export const NavDesktop = ({ links }: NavDesktopProps) => {
  if (!links || links.length === 0) return null;

  return (
    <NavigationMenuList className="hidden h-full gap-8 xl:flex">
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
  );
};

const MegaMenuNode = ({ item }: { item: NavMenuMega }) => {
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
                    className="transition-300 hover:bg-hover-background/80 flex items-start gap-0 rounded-xl p-4 text-base font-medium"
                  >
                    {link.label}
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
                    className="hover:border-brand bg-card relative flex h-full items-end rounded-xl border-2 border-transparent transition-colors duration-300"
                  >
                    <div className="flex flex-col gap-0 p-4">
                      <span className="font-medium">{card.label}</span>
                      <span className="text-muted-foreground">
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
            ))}
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
    <NavigationMenuItem>
      <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className={cn("grid h-full min-w-fit gap-3", gridClass)}>
          {item.items.map((subItem) => (
            <li key={subItem.href} className={"h-full min-h-95"}>
              <NavigationMenuLink asChild>
                <Link
                  href={subItem.href}
                  className="hover:border-brand bg-card relative flex h-full items-start rounded-xl border-2 border-transparent transition-colors duration-300"
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
              "group text-muted-foreground hover:stroke-foreground gap-1.5 bg-transparent",
            )}
          >
            {item.label}
            <ExternalLink className="transition-stroke group-hover:stroke-foreground stroke-muted-foreground size-3.5 duration-300" />
          </a>
        ) : (
          <Link
            href={item.href}
            className={cn(
              navigationMenuTriggerStyle(),
              "text-muted-foreground bg-transparent",
            )}
          >
            {item.label}
          </Link>
        )}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};
