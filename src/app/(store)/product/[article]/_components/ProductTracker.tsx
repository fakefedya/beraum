"use client";

import { useEffect } from "react";
import { reachYmGoal } from "@/src/lib/analytics/ym";

interface ProductTrackerProps {
  article: string;
  categorySlug?: string;
  categoryName?: string;
}

export const ProductTracker = ({
  article,
  categorySlug,
  categoryName,
}: ProductTrackerProps) => {
  useEffect(() => {
    reachYmGoal("view_item", {
      article,
      category_slug: categorySlug,
      category_name: categoryName,
    });
  }, [article, categorySlug, categoryName]);

  return null;
};
