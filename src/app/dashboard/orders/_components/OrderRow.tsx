"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/src/server/actions/admin-orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { PanelRightOpen, Loader2 } from "lucide-react";
import { CopyButton } from "@/src/components/shared/CopyButton";
import { cn } from "@/src/lib/utils";
import type { OrderItem } from "./OrdersTable";

export const ORDER_STATUS_MAP: Record<
  OrderItem["status"],
  { label: string; color: string }
> = {
  new: {
    label: "Новый",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  processing: {
    label: "В работе",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  completed: {
    label: "Выполнен",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  cancelled: {
    label: "Отменен",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
};

export const OrderRow = ({
  order,
  onOpen,
}: {
  order: OrderItem;
  onOpen: () => void;
}) => {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("orderId", order.id);
      formData.append("status", newStatus);

      const res = await updateOrderStatusAction(formData);
      if (res.success) {
        toast.success("Статус изменен");
      } else {
        toast.error(res.error || "Ошибка обновления");
      }
    });
  };

  const statusConfig = ORDER_STATUS_MAP[order.status];

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="text-foreground text-xs font-semibold">
              {order.orderNumber}
            </span>
            <CopyButton
              textToCopy={order.orderNumber}
              className="text-muted-foreground hover:text-foreground h-6 w-6"
            />
          </div>
          <span className="text-muted-foreground text-xs font-medium">
            {new Intl.DateTimeFormat("ru-RU", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(order.createdAt))}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        {/* ИСПОЛЬЗУЕМ value ВМЕСТО defaultValue! */}
        <Select
          value={order.status}
          disabled={isPending}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger
            className={cn(
              "h-8 border-none text-xs font-medium shadow-none md:text-sm",
              statusConfig.color,
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Новый</SelectItem>
            <SelectItem value="processing">В работе</SelectItem>
            <SelectItem value="completed">Выполнен</SelectItem>
            <SelectItem value="cancelled">Отменен</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-foreground font-medium">{order.name}</span>
          <span className="text-muted-foreground text-xs">{order.phone}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-foreground text-xs font-medium uppercase">
                {item.siteArticle}
              </span>
              <span className="text-muted-foreground font-mono text-[10px]">
                {item.uniqueSku}
              </span>
            </div>
          ))}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium">
            {order.deliveryMethod === "pickup" ? "Самовывоз" : "Доставка"}
          </span>
          <span className="text-muted-foreground">
            {order.paymentMethod === "card" ? "Карта" : "Наличные"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 font-semibold whitespace-nowrap">
        {order.totalAmount.toLocaleString("ru-RU")} ₽
      </td>
      <td className="px-6 py-4 text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpen}
          className="hover:bg-background/60 w-full border-none shadow-none"
        >
          <PanelRightOpen className="mr-2 size-4" /> Открыть
        </Button>
      </td>
    </tr>
  );
};
