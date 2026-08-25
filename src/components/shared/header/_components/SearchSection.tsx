"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

import { buildImageUrl, cn } from "@/src/lib/utils";
import { useDebounce } from "@/src/hooks/use-debounce";
import type { CatalogProduct } from "@/src/server/queries/products";
import { SafeImage } from "../../SafeImage";

const LIMIT = 10;

export const SearchSection = () => {
  const pathname = usePathname();
  const isDiscount = pathname.startsWith("/discount");

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setOffset(0);
    setHasMore(false);
  }

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const queryTrimmed = debouncedQuery.trim();

    if (!queryTrimmed) return;

    let isMounted = true;

    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const url = new URL("/api/products", window.location.origin);
        url.searchParams.set("q", queryTrimmed);
        url.searchParams.set("limit", LIMIT.toString());
        url.searchParams.set("offset", "0");

        const res = await fetch(url.toString());
        const json = await res.json();

        if (isMounted && json.success && json.data) {
          setResults(json.data);
          setOffset(LIMIT);
          setHasMore(json.data.length === LIMIT);
        }
      } catch (error) {
        console.error("Ошибка поиска:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const url = new URL("/api/products", window.location.origin);
      url.searchParams.set("q", debouncedQuery.trim());
      url.searchParams.set("limit", LIMIT.toString());
      url.searchParams.set("offset", offset.toString());

      const res = await fetch(url.toString());
      const json = await res.json();

      if (json.success && json.data) {
        setResults((prev) => [...prev, ...json.data]);
        setOffset((prev) => prev + LIMIT);
        setHasMore(json.data.length === LIMIT);
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isDiscount) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="transparent"
          size="icon-xs"
          className={cn(
            "text-foreground rounded-[16px] transition-colors duration-300",
            "[&_svg:not([class*='size-'])]:size-6",
            "hover:bg-card lg:h-12 lg:w-12 lg:[&_svg]:stroke-[2.5] lg:[&_svg:not([class*='size-'])]:size-4.5",
          )}
          aria-label="Открыть поиск"
        >
          <Search />
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "translate-x-0 translate-y-0",
          "fixed top-4 left-0 z-50 w-full max-w-none min-w-full border-none bg-transparent p-0 px-4 shadow-none",
          "data-[state=closed]:duration-300",
          "md:left-0 md:max-w-none md:px-6",
        )}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Поиск по каталогу</DialogTitle>

        <div
          className={cn(
            "bg-background/80 shadow-nav relative mx-auto flex w-full max-w-full flex-col gap-4 overflow-hidden rounded-xl p-1 backdrop-blur-xl backdrop-saturate-150",
            "md:rounded-[20px] md:p-1.5",
            "lg:w-fit lg:min-w-3xl",
          )}
        >
          <div
            className={cn(
              "bg-background flex h-12 shrink-0 items-center gap-5 rounded-lg px-8 py-4",
              "md:rounded-[14px]",
            )}
          >
            <Search className="text-foreground size-4.5 stroke-[2.5]" />
            <input
              type="text"
              placeholder="Поиск по артикулу или категории..."
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                if (!val.trim()) {
                  setResults([]);
                  setOffset(0);
                  setHasMore(false);
                }
              }}
              className="placeholder:text-muted-foreground/80 flex-1 bg-transparent text-base font-medium outline-none"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setOffset(0);
                  setHasMore(false);
                }}
                className="text-muted-foreground hover:text-foreground rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                <X
                  className={cn(
                    "stoke-[2.5] text-muted-foreground size-5 cursor-pointer",
                    "hover:text-foreground transition-colors duration-300",
                  )}
                />
              </button>
            )}
          </div>

          {query.trim().length > 0 && (
            <div className="flex flex-col px-2 pb-2">
              {isLoading && offset === 0 ? (
                <div className="text-muted-foreground flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-2">
                  {results.flatMap((product) =>
                    product.variants.map((variant) => {
                      const imageUrl = buildImageUrl(variant.image);

                      return (
                        <Link
                          key={variant.itemArticle}
                          prefetch={false}
                          href={`/product/${variant.itemArticle.toLowerCase()}`}
                          className={cn(
                            "group flex items-center gap-4 rounded-xl p-2 transition-colors outline-none",
                            "hover:bg-background",
                            "focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-black",
                          )}
                        >
                          <div className="bg-accent relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                            <SafeImage
                              src={imageUrl}
                              alt={variant.itemArticle}
                              fill
                              sizes="56px"
                              className={cn(
                                "transition-transform duration-500 group-hover:scale-105",
                                variant.image?.fit === "cover"
                                  ? "object-cover"
                                  : "object-contain",
                              )}
                            />
                          </div>

                          {/* Инфо (Название и тип) */}
                          <div className="flex flex-1 flex-col overflow-hidden">
                            <span className="text-foreground truncate font-medium">
                              {variant.itemArticle}
                            </span>
                            <span
                              className={cn(
                                "text-muted-foreground truncate text-sm",
                                "md:text-base",
                              )}
                            >
                              {product.productType}
                            </span>
                          </div>

                          <div className="flex shrink-0 flex-col items-end justify-center pl-2">
                            {variant.price > 0 ? (
                              <span
                                className={cn(
                                  "text-foreground text-sm whitespace-nowrap",
                                  "md:text-base",
                                )}
                              >
                                от {variant.price.toLocaleString("ru-RU")} ₽
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  "text-muted-foreground text-sm whitespace-nowrap",
                                  "md:text-base",
                                )}
                              >
                                По запросу
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    }),
                  )}

                  {hasMore ? (
                    <Button
                      className={cn(
                        "bg-background text-foreground h-12 gap-4 rounded-[16px] px-4 text-base font-medium",
                        "duration-300 hover:bg-gray-200",
                      )}
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : null}
                      {isLoadingMore ? "Загрузка..." : "Показать еще"}
                    </Button>
                  ) : (
                    <div className="text-muted-foreground/60 mt-4 pb-4 text-center text-sm font-medium">
                      Все результаты загружены
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-foreground py-12 text-center text-base font-medium">
                  Ничего не найдено по запросу «{query}»
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
