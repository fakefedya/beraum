"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";
import { cn } from "@/src/lib/utils";

interface CatalogPaginationProps {
  currentPage: number;
  hasMore: boolean;
}

export const CatalogPagination = ({
  currentPage,
  hasMore,
}: CatalogPaginationProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (currentPage === 1 && !hasMore) return null;

  return (
    <div className="mt-4 flex w-full justify-center pb-8">
      <Pagination>
        <PaginationContent className="gap-2 sm:gap-4">
          <PaginationItem>
            <PaginationPrevious
              href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
              aria-disabled={currentPage <= 1}
              tabIndex={currentPage <= 1 ? -1 : undefined}
              className={cn(
                "bg-card h-10 rounded-xl border-none shadow-none transition-colors",
                currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-gray-200",
              )}
            />
          </PaginationItem>

          <PaginationItem>
            <div className="bg-card flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium">
              Страница {currentPage}
            </div>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              href={hasMore ? createPageUrl(currentPage + 1) : "#"}
              aria-disabled={!hasMore}
              tabIndex={!hasMore ? -1 : undefined}
              className={cn(
                "bg-card h-10 rounded-xl border-none shadow-none transition-colors",
                !hasMore
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-gray-200",
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
