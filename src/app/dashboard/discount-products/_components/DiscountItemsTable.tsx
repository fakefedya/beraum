"use client";

import type { DiscountMedia } from "@/src/server/db/schema/discount.schema";
import { DiscountItemRow } from "./DiscountItemsRow";

export type DiscountItemDTO = {
  id: string;
  uniqueSku: string;
  defectDescription: string;
  discountPrice: number;
  status: "available" | "reserved" | "sold";
  reservedAt: Date | null;
  mediaKeys: DiscountMedia[];
  baseArticle: string;
  categoryName: string;
};

export const DiscountItemsTable = ({
  initialData,
}: {
  initialData: DiscountItemDTO[];
}) => {
  if (!initialData.length) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">
        Товары не найдены.
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="text-muted-foreground border-b text-xs uppercase">
        <tr>
          <th className="px-4 py-4 font-medium">SKU</th>
          <th className="px-4 py-4 font-medium">Статус</th>
          <th className="px-4 py-4 font-medium">Категория</th>
          <th className="px-4 py-4 font-medium">Дефект</th>
          <th className="px-4 py-4 font-medium">Цена</th>
          <th className="w-32 px-4 py-4 font-medium">Действия</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {initialData.map((item) => (
          <DiscountItemRow key={item.id} item={item} />
        ))}
      </tbody>
    </table>
  );
};
