"use client";

import type { products } from "@/src/server/db/schema";
import { ProductRow } from "./ProductRow";

type ProductItem = typeof products.$inferSelect;

export const ProductsTable = ({
  initialData,
}: {
  initialData: ProductItem[];
}) => {
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-muted-foreground bg-muted/50 border-b text-xs uppercase">
        <tr>
          <th className="px-4 py-3 font-medium">Артикул / SKU</th>
          <th className="px-4 py-3 font-medium">Остатки</th>
          <th className="w-32 px-4 py-3 font-medium">Статус</th>
          <th className="w-24 px-4 py-3 font-medium">
            Стоимость до скидки / Скидка %
          </th>
          <th className="min-w-50 px-4 py-3 font-medium">Маркетплейсы</th>
          <th className="min-w-60 px-4 py-3 font-medium">Свойства JSON</th>
          <th className="w-32 px-4 py-3 font-medium">Действия</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {initialData.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </tbody>
    </table>
  );
};
