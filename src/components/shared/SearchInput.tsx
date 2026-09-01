"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/src/hooks/use-debounce";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  paramName?: string;
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({
  paramName = "q",
  placeholder = "Поиск...",
  className = "relative w-full max-w-sm",
}: SearchInputProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const initialQuery = searchParams.get(paramName) || "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const currentQ = searchParams.get(paramName) || "";
    if (debouncedQuery === currentQ) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set(paramName, debouncedQuery);
    } else {
      params.delete(paramName);
    }

    if (paramName !== "page") {
      params.delete("page");
    }

    replace(`${pathname}?${params.toString()}`);
  }, [debouncedQuery, pathname, replace, searchParams, paramName]);

  return (
    <div className={className}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <input
        type="text"
        placeholder={placeholder}

        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border pr-9 pl-9 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          type="button"
          aria-label="Очистить поиск"
          onClick={() => setQuery("")}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
