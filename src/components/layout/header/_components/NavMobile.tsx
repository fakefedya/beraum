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
          className="[&_svg:size-6] text-black-muted transition-colors duration-300 xl:hidden"
          aria-label="Открыть меню"
        >
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-full flex-col gap-0 border-none bg-white px-7 pt-21 pb-8 sm:max-w-full"
      >
        <SheetTitle className="sr-only">Навигация по сайту</SheetTitle>

        <div
          className={cn(
            "absolute top-4 left-4 h-12 rounded-full p-1",
            isDiscount ? "bg-brand" : "bg-glass",
          )}
        >
          <div
            className={cn(
              "flex h-full items-center justify-center rounded-full px-3",
              isDiscount ? "bg-white" : "bg-brand",
            )}
          >
            {isDiscount ? (
              <span className="text-lg font-medium text-black">Дисконт</span>
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
                      className="border-b border-black/5 py-4 last:border-0"
                    >
                      <Link
                        href={link.href}
                        target={isExt ? link.target : "_self"}
                        rel={isExt ? "noopener noreferrer" : undefined}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between text-lg font-medium text-black outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                      >
                        {link.label}
                        {isExt && (
                          <ExternalLink className="stroke-black-muted size-3.5" />
                        )}
                      </Link>
                    </div>
                  );
                }

                return (
                  <AccordionItem
                    value={`item-${idx}`}
                    key={`mobile-nav-${idx}`}
                    className="border-black/5"
                  >
                    <AccordionTrigger className="py-4 text-lg font-medium text-black hover:no-underline">
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
                                className="text-black-muted font-base flex flex-col-reverse items-start text-base transition-colors outline-none hover:text-black focus-visible:ring-2 focus-visible:ring-black/20"
                              >
                                {subItem.label}
                                {subItem.isNew && (
                                  <span className="text-brand text-xs leading-3 font-medium">
                                    Новые модели
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>

                          <div className="mt-2 flex flex-col gap-3 border-t border-black/5 pt-4 md:grid md:grid-cols-3">
                            {link.promoCards.map((card) => (
                              <Link
                                key={card.href}
                                href={card.href}
                                onClick={() => setIsOpen(false)}
                                className="hover:border-brand relative flex items-end rounded-xl border-2 border-transparent bg-gray-50 transition-colors duration-300"
                              >
                                <div className="absolute bottom-2 left-2 flex flex-col gap-0 p-2">
                                  <span className="font-medium text-black">
                                    {card.label}
                                  </span>
                                  <span className="text-black-muted">
                                    {card.description}
                                  </span>
                                </div>
                                {card.isNew && (
                                  <Badge
                                    variant={"new"}
                                    className="absolute top-4 right-4"
                                  >
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
                              className="text-black-muted text-base font-normal transition-colors outline-none hover:text-black focus-visible:ring-2 focus-visible:ring-black/20"
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

          <div className="mt-auto border-t border-black/5 bg-white pt-6 pb-12">
            <span className="text-black-muted mb-6 block text-lg font-medium">
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
                    className="bg-glass flex items-center gap-3 rounded-xl p-1 transition-colors outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-black/20"
                  >
                    <Icon className="size-12 shrink-0 text-black" />
                    <span className="text-sm font-medium text-black">
                      {market.label}
                    </span>
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
