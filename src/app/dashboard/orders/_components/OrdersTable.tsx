"use client";

import { useState } from "react";
import type { orders } from "@/src/server/db/schema/orders.schema";
import { OrderRow } from "./OrderRow";
import { OrderDetailsSheet } from "./OrderDetailsSheet";

export type OrderItem = typeof orders.$inferSelect;

export const OrdersTable = ({ initialData }: { initialData: OrderItem[] }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder =
    initialData.find((o) => o.id === selectedOrderId) || null;

  if (!initialData.length) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">
        Заказы не найдены.
      </div>
    );
  }

  return (
    <>
      <table className="bg-muted w-full text-left text-sm">
        <thead className="text-muted-foreground border-b text-xs uppercase">
          <tr>
            <th className="px-6 py-3 font-medium">Заказ</th>
            <th className="px-6 py-3 font-medium">Статус</th>
            <th className="px-6 py-3 font-medium">Покупатель</th>
            <th className="px-6 py-3 font-medium">Товары</th>
            <th className="px-6 py-3 font-medium">Доставка / Оплата</th>
            <th className="px-6 py-3 font-medium">Сумма</th>
            <th className="w-32 px-6 py-3 font-medium">Действия</th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y">
          {initialData.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onOpen={() => setSelectedOrderId(order.id)}
            />
          ))}
        </tbody>
      </table>
      <OrderDetailsSheet
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrderId(null)}
      />
    </>
  );
};
