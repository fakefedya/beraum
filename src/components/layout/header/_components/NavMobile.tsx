"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ExternalLink } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/src/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Badge } from "@/src/components/ui/badge";
import { MARKETPLACE_LINKS, type NavItem } from "@/src/lib/constants";
import { Icons } from "@/src/components/ui/icons";
import { cn } from "@/src/lib/utils";

interface NavMobileProps {
  links: readonly NavItem[];
}

export const NavMobile = ({ links }: NavMobileProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isDiscount = pathname.startsWith("/discount");
  const marketLinks = isDiscount
    ? MARKETPLACE_LINKS.discount
    : MARKETPLACE_LINKS.store;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="transparent"
          size="icon-xs"
          className="[&_svg:size-6] text-muted-foreground transition-colors duration-300 xl:hidden"
          aria-label="Открыть меню"
        >
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="bg-background flex w-full flex-col gap-0 border-none px-7 pt-21 pb-8 sm:max-w-full"
      >
        <SheetTitle className="sr-only">Навигация по сайту</SheetTitle>

        <div
          className={cn(
            "absolute top-4 left-4 h-12 rounded-full p-1",
            isDiscount ? "bg-brand" : "bg-frosted-glass",
          )}
        >
          <div
            className={cn(
              "flex h-full items-center justify-center rounded-full px-3",
              isDiscount ? "bg-background" : "bg-brand",
            )}
          >
            {isDiscount ? (
              <span className="text-lg font-medium">Дисконт</span>
            ) : (
              <Icons.logo className="h-4 w-fit stroke-current stroke-[0.25] [shape-rendering:crispEdges]" />
            )}
          </div>
        </div>

        <div className="flex h-full flex-col overflow-y-auto">
          <div>
            <Accordion type="multiple" className="w-full">
              {links.map((link, idx) => {
                if (link.type === "link" || link.type === "external") {
                  const isExt = link.type === "external";
                  return (
                    <div
                      key={`mobile-nav-${idx}`}
                      className="border-border border-b py-4 last:border-0"
                    >
                      <Link
                        href={link.href}
                        target={isExt ? link.target : "_self"}
                        rel={isExt ? "noopener noreferrer" : undefined}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between text-lg font-medium outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                      >
                        {link.label}
                        {isExt && (
                          <ExternalLink className="stroke-muted-foreground size-3.5" />
                        )}
                      </Link>
                    </div>
                  );
                }

                return (
                  <AccordionItem
                    value={`item-${idx}`}
                    key={`mobile-nav-${idx}`}
                    className="border-border"
                  >
                    <AccordionTrigger className="py-4 text-lg font-medium hover:no-underline">
                      {link.label}
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col pt-1 pb-4">
                      {link.type === "mega" ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-4">
                            {link.sidebarLinks.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setIsOpen(false)}
                                className="text-muted-foreground font-base hover:text-foreground flex flex-col-reverse items-start text-base transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>

                          <div className="border-border mt-2 flex flex-col gap-3 border-t pt-4 md:grid md:grid-cols-3">
                            {link.promoCards.map((card) => (
                              <Link
                                key={card.href}
                                href={card.href}
                                onClick={() => setIsOpen(false)}
                                className="hover:border-brand bg-card relative flex items-end rounded-xl border-2 border-transparent transition-colors duration-300"
                              >
                                <div className="absolute bottom-2 left-2 flex flex-col gap-0 p-2">
                                  <span className="font-medium">
                                    {card.label}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {card.description}
                                  </span>
                                </div>
                                {card.isNew && (
                                  <Badge className="bg-brand text-foreground absolute top-4 right-4 uppercase">
                                    Новинка
                                  </Badge>
                                )}
                                <div className="flex aspect-video w-full items-center justify-center rounded-lg md:aspect-2/3"></div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {link.items.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setIsOpen(false)}
                              className="text-muted-foreground text-base font-normal transition-colors outline-none hover:text-black focus-visible:ring-2 focus-visible:ring-black/20"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          <div className="bg-background mt-auto pt-6 pb-12">
            <span className="border-border mb-6 block border-b pb-4 text-lg font-medium">
              Где купить
            </span>
            <div className="grid grid-cols-2 gap-3">
              {marketLinks.map((market) => {
                const Icon = market.icon;
                return (
                  <a
                    key={market.label}
                    href={market.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-card flex items-center gap-3 rounded-xl p-1 transition-colors outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-black/20"
                  >
                    <Icon className="size-12 shrink-0" />
                    <span className="text-sm font-medium">{market.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
