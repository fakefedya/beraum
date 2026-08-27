"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/src/hooks/use-debounce";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export const RequestsSearch = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    replace(`${pathname}?${params.toString()}`);
  }, [debouncedQuery, pathname, replace, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <input
        type="text"
        placeholder="Поиск по ID или Email..."
        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border pr-4 pl-9 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};
