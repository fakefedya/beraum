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
import {
  MARKETPLACE_LINKS,
  type NavItem,
  FOOTER_LINKS,
} from "@/src/lib/constants";
import { Icons } from "@/src/components/ui/icons";
import { buildImageUrl, cn } from "@/src/lib/utils";
import { SafeImage } from "../../SafeImage";
import { SupportStatus } from "../../SupportStatus";

interface NavMobileProps {
  links: readonly NavItem[];
}

export const NavMobile = ({ links }: NavMobileProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isDiscount = pathname.startsWith("/discount");
  const marketLinks = isDiscount
    ? MARKETPLACE_LINKS.discount.filter((link) => link.isEnabled)
    : MARKETPLACE_LINKS.store.filter((link) => link.isEnabled);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-foreground relative z-20 flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-lg outline-none",
            "hover:bg-card transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-black",
            "cursor-pointer select-none",
            "[&_svg]:pointer-events-none [&_svg]:size-6",
            "lg:hidden",
          )}
          aria-label="Открыть меню"
        >
          <Menu />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className={cn(
          "bg-background flex w-full flex-col gap-0 border-none px-6 pt-21 pb-8",
          "sm:max-w-full",
          "md:w-fit md:min-w-lg md:rounded-tr-4xl md:rounded-br-4xl",
        )}
      >
        <SheetTitle className="sr-only">Навигация по сайту</SheetTitle>

        <div
          className={cn(
            "bg-brand absolute top-4 left-4 h-11 rounded-lg px-4",
            "md:h-12 md:rounded-[16px]",
          )}
        >
          <div className="flex h-full items-center justify-center">
            {isDiscount ? (
              <span className="font-semibold">Дисконт</span>
            ) : (
              <Icons.logo
                className={cn(
                  "h-4 w-fit fill-current stroke-current stroke-[0.25] [shape-rendering:crispEdges]",
                  "md:h-5",
                )}
              />
            )}
          </div>
        </div>

        <div className="flex h-full flex-col overflow-y-auto">
          <div>
            <Accordion type="multiple" className="w-full">
              {links.map((link, idx) => {
                if (link.type === "link" || link.type === "external") {
                  const isExt = link.type === "external";
                  const isComingSoon =
                    "isDisabled" in link ? link.isDisabled : false;

                  return (
                    <div key={`mobile-nav-${idx}`} className="py-4">
                      <Link
                        prefetch={false}
                        href={isComingSoon ? "#" : link.href}
                        target={isExt ? link.target : "_self"}
                        rel={isExt ? "noopener noreferrer" : undefined}
                        aria-disabled={isComingSoon}
                        onClick={(e) => {
                          if (isComingSoon) {
                            e.preventDefault();
                          } else {
                            setIsOpen(false);
                          }
                        }}
                        className={cn(
                          "flex items-center justify-between text-xl font-medium outline-none",
                          "transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-black/20",
                          isComingSoon
                            ? "text-muted-foreground/50 cursor-default"
                            : "text-foreground hover:text-brand-secondary-muted",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span>{link.label}</span>

                          {isComingSoon && (
                            <span className="pointer-events-none -rotate-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_2px_4px_rgba(255,255,255,0.05)]">
                              <span
                                className={cn(
                                  "bg-brand flex items-center justify-center px-2 py-0.5",
                                  "text-[9px] font-bold tracking-widest whitespace-nowrap text-[#1a1a1b] uppercase",
                                  "[clip-path:polygon(0%_0%,_100%_0%,_calc(100%-4px)_16.6%,_100%_33.3%,_calc(100%-4px)_50%,_100%_66.6%,_calc(100%-4px)_83.3%,_100%_100%,_0%_100%,_4px_83.3%,_0%_66.6%,_4px_50%,_0%_33.3%,_4px_16.6%)]",
                                )}
                              >
                                Скоро
                              </span>
                            </span>
                          )}
                        </div>

                        {isExt && !isComingSoon && (
                          <ExternalLink className="stroke-muted-foreground size-4.5" />
                        )}
                      </Link>
                    </div>
                  );
                }

                return (
                  <AccordionItem
                    value={`item-${idx}`}
                    key={`mobile-nav-${idx}`}
                    className="border-none"
                  >
                    <AccordionTrigger
                      className={cn(
                        "py-4 text-xl font-medium",
                        "hover:no-underline",
                      )}
                    >
                      {link.label}
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col pt-1 pb-4">
                      {link.type === "mega" ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-6">
                            {link.sidebarLinks.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "text-muted-foreground font-base flex flex-col-reverse items-start text-base outline-none",
                                  "focus-visible:ring-2 focus-visible:ring-black/20",
                                  "hover:text-foreground transition-colors",
                                )}
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>

                          <div className="mt-2 flex flex-col gap-3 pt-4">
                            {link.promoCards.map((card) => {
                              const imageUrl = buildImageUrl(card.cover);
                              return (
                                <Link
                                  key={card.href}
                                  href={card.href}
                                  onClick={() => setIsOpen(false)}
                                  className={cn(
                                    "group bg-card relative flex aspect-2/3 w-full overflow-hidden rounded-xl border-2 border-transparent",
                                    "hover:border-brand transition-colors duration-300",
                                    "outline-none focus-visible:ring-2 focus-visible:ring-black",
                                  )}
                                >
                                  <div className="bg-accent relative h-full w-full overflow-hidden rounded-lg">
                                    <SafeImage
                                      src={imageUrl}
                                      alt={card.description}
                                      fill
                                      sizes="(max-width: 1024px) 100vw, 66vw"
                                      className={cn(
                                        "object-cover",
                                        "transition-transform duration-500 group-hover:scale-102",
                                      )}
                                    />
                                  </div>
                                  <div className="bg-background/80 shadow-nav absolute bottom-4 left-4 flex w-fit max-w-[calc(100%-32px)] flex-col gap-0 rounded-[12px] px-4 py-1.5 backdrop-blur-xl backdrop-saturate-150">
                                    <span className="line-clamp-1 font-medium">
                                      {card.label}
                                    </span>
                                    <span className="text-muted-foreground line-clamp-2 text-sm">
                                      {card.description}
                                    </span>
                                  </div>

                                  {card.isNew && (
                                    <Badge className="bg-brand text-foreground absolute top-4 right-4 font-medium uppercase">
                                      Новинка
                                    </Badge>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6">
                          {link.items.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "text-muted-foreground text-base font-normal transition-colors outline-none",
                                "focus-visible:ring-2 focus-visible:ring-black/20",
                                "hover:text-black",
                              )}
                            >
                              {subItem.href === "/support" ? (
                                <span className="flex gap-1">
                                  {subItem.label}
                                  <SupportStatus className="mt-0.5 h-2 w-2" />
                                </span>
                              ) : (
                                subItem.label
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}

              <AccordionItem value="legal-links">
                <AccordionTrigger
                  className={cn(
                    "py-4 text-xl font-medium",
                    "hover:no-underline",
                  )}
                >
                  T&C
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-6 pt-1 pb-4">
                  {FOOTER_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={false}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-muted-foreground text-base font-normal transition-colors outline-none",
                        "focus-visible:ring-2 focus-visible:ring-black/20",
                        "hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="bg-background mt-auto pt-6 pb-12">
            <span className="block pb-4 text-xl font-medium">Где купить</span>
            <div className="flex flex-col gap-3">
              {marketLinks.map((market) => {
                const Icon = market.icon;
                return (
                  <a
                    key={market.label}
                    href={market.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "bg-card flex items-center gap-3 rounded-xl p-6 outline-none",
                      "focus-visible:ring-2 focus-visible:ring-black/20",
                      "transition-colors hover:bg-gray-100",
                    )}
                  >
                    <div className="flex shrink-0 items-center justify-center">
                      <Icon className="size-12" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-base leading-none font-medium">
                        {market.label}
                      </span>
                      <span className="text-foreground/80 text-sm font-normal">
                        {market.description}
                      </span>
                    </div>
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
