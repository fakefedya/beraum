"use client";

import { Badge } from "@/src/components/ui/badge";

const statusMap = {
  available: { label: "Доступен", cls: "bg-green-100 text-green-800" },
  reserved: { label: "Бронь", cls: "bg-yellow-100 text-yellow-800" },
  sold: { label: "Продан", cls: "bg-gray-100 text-gray-800" },
};

export const DiscountItemsTable = ({ initialData }: { initialData: any[] }) => {
  if (!initialData.length) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">
        Товары не найдены.
      </div>
    );
  }

  return (
    <table className="bg-muted w-full text-left text-sm">
      <thead className="text-muted-foreground border-b text-xs uppercase">
        <tr>
          <th className="px-4 py-3 font-medium">SKU / База</th>
          <th className="px-4 py-3 font-medium">Категория</th>
          <th className="px-4 py-3 font-medium">Дефект</th>
          <th className="px-4 py-3 font-medium">Цена (Дисконт)</th>
          <th className="px-4 py-3 font-medium">Статус</th>
        </tr>
      </thead>
      <tbody className="bg-card divide-y">
        {initialData.map((item) => (
          <tr key={item.id} className="hover:bg-muted/50">
            <td className="px-4 py-3">
              <div className="flex flex-col gap-1">
                <span className="font-mono font-semibold">
                  {item.uniqueSku}
                </span>
                <span className="text-muted-foreground text-xs">
                  База: {item.baseArticle}
                </span>
              </div>
            </td>
            <td className="text-muted-foreground px-4 py-3">
              {item.categoryName}
            </td>
            <td
              className="max-w-xs truncate px-4 py-3"
              title={item.defectDescription}
            >
              {item.defectDescription}
            </td>
            <td className="px-4 py-3 font-medium">
              {item.discountPrice.toLocaleString("ru-RU")} ₽
            </td>
            <td className="px-4 py-3">
              <Badge
                className={`shadow-none ${statusMap[item.status as keyof typeof statusMap].cls}`}
              >
                {statusMap[item.status as keyof typeof statusMap].label}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
