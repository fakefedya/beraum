// src/app/dashboard/products/_components/ProductsSearch.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/src/hooks/use-debounce";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export const ProductsSearch = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    if (debouncedQuery === currentQ) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    params.delete("page"); // Сброс пагинации при поиске

    replace(`${pathname}?${params.toString()}`);
  }, [debouncedQuery, pathname, replace, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <input
        type="text"
        placeholder="Поиск по артикулу или категории..."
        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border pr-4 pl-9 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};
