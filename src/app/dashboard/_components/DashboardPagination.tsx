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

interface DashboardPaginationProps {
  currentPage: number;
  hasMore: boolean;
}

export const DashboardPagination = ({
  currentPage,
  hasMore,
}: DashboardPaginationProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (currentPage === 1 && !hasMore) return null;

  return (
    <div className="flex w-full justify-center">
      <Pagination>
        <PaginationContent className="gap-2">
          <PaginationItem>
            <PaginationPrevious
              href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
              aria-disabled={currentPage <= 1}
              tabIndex={currentPage <= 1 ? -1 : undefined}
              className={cn(
                "h-9 rounded-lg border-none shadow-none transition-colors",
                currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-muted",
              )}
            />
          </PaginationItem>

          <PaginationItem>
            <div className="bg-muted text-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium">
              Страница {currentPage}
            </div>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              href={hasMore ? createPageUrl(currentPage + 1) : "#"}
              aria-disabled={!hasMore}
              tabIndex={!hasMore ? -1 : undefined}
              className={cn(
                "h-9 rounded-lg border-none shadow-none transition-colors",
                !hasMore ? "pointer-events-none opacity-50" : "hover:bg-muted",
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
