"use client";

import { useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Barcode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/src/server/actions/admin-orders";
import { cn } from "@/src/lib/utils";
import type { OrderItem } from "./OrdersTable";
import { ORDER_STATUS_MAP } from "./OrderRow";

export const OrderDetailsSheet = ({
  order,
  isOpen,
  onClose,
}: {
  order: OrderItem | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [isPending, startTransition] = useTransition();

  if (!order) return null;

  const d = order.deliveryDetails;
  const statusConfig = ORDER_STATUS_MAP[order.status];

  // Если статус финальный (выполнен/отменен), прячем блок управления
  const isFinalStatus =
    order.status === "completed" || order.status === "cancelled";

  // Строгая типизация: разрешаем только финальные переходы из интерфейса Sheet
  const handleStatusChange = (newStatus: "completed" | "cancelled") => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("orderId", order.id);
      formData.append("status", newStatus);

      const res = await updateOrderStatusAction(formData);

      if (res.success) {
        toast.success("Статус изменен, товары обновлены");
        onClose(); // Закрываем карточку, так как статус финальный
      } else {
        toast.error(res.error || "Ошибка обновления статуса");
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        className={cn(
          "flex h-dvh w-full flex-col gap-0 overflow-hidden border-none p-0",
          "sm:max-w-md md:inset-y-4 md:right-4 md:h-[calc(100dvh-32px)] md:rounded-4xl",
        )}
      >
        <SheetHeader className="px-6 pt-6 pb-2 text-left">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-xl">
              <span className="text-muted-foreground">Заказ </span>
              {order.orderNumber}
            </SheetTitle>
            <Badge
              className={cn("border-none shadow-none", statusConfig.color)}
            >
              {statusConfig.label}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 scrollbar-thin overflow-y-auto px-6 pb-6">
          <div className="flex flex-col gap-8 pt-4">
            {/* Блок 1: Товары */}
            <section className="flex flex-col gap-3">
              <h4 className="text-foreground font-medium">Товары</h4>
              <div className="flex flex-col gap-4">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-muted flex flex-col gap-0.5 rounded-xl p-3"
                  >
                    <span className="text-muted-foreground text-xs">
                      {item.categoryName}
                    </span>
                    <span className="font-semibold uppercase">
                      {item.siteArticle}
                    </span>

                    <span className="text-muted-foreground flex items-center gap-1 truncate font-mono text-xs">
                      <Barcode size={14} />
                      {item.uniqueSku}
                    </span>
                    <span className="text-sm font-medium">
                      {item.price.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between py-4 font-medium">
                <span className="text-foreground">Итого:</span>
                <span className="text-foreground text-lg">
                  {order.totalAmount.toLocaleString("ru-RU")} ₽
                </span>
              </div>
            </section>

            {/* Блок 2: Данные покупателя */}
            <section className="flex flex-col gap-3">
              <h4 className="text-foreground font-medium">Покупатель</h4>
              <div className="bg-muted flex flex-col gap-3 rounded-xl p-4 text-sm">
                <div className="border-border/50 border-b pb-2">
                  <span className="text-muted-foreground mr-2">Имя:</span>
                  <span className="font-medium">{order.name}</span>
                </div>
                <div className="border-border/50 border-b pb-2">
                  <span className="text-muted-foreground mr-2">Телефон:</span>
                  <span className="font-medium">{order.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground mr-2">Email:</span>
                  <span className="font-medium">{order.email}</span>
                </div>
              </div>
            </section>

            {/* Блок 3: Доставка и Оплата */}
            <section className="flex flex-col gap-3">
              <h4 className="text-foreground font-medium">
                Получение и оплата
              </h4>
              <div className="bg-muted flex flex-col gap-3 rounded-xl p-4 text-sm">
                <div className="border-border/50 border-b pb-2">
                  <span className="text-muted-foreground mr-2">
                    Тип получения:
                  </span>
                  <span className="font-medium">
                    {order.deliveryMethod === "pickup"
                      ? "Самовывоз"
                      : "Доставка"}
                  </span>
                </div>
                <div
                  className={cn(
                    "border-border/50",
                    order.deliveryMethod === "delivery" && "border-b pb-2",
                  )}
                >
                  <span className="text-muted-foreground mr-2">
                    Способ оплаты:
                  </span>
                  <span className="font-medium">
                    {order.paymentMethod === "card" ? "Карта" : "Наличные"}
                  </span>
                </div>

                {order.deliveryMethod === "delivery" && (
                  <>
                    <div className="border-border/50 border-b pb-2">
                      <span className="text-muted-foreground mr-2">Адрес:</span>
                      <span className="font-medium">{d.address}</span>
                    </div>
                    <div
                      className={cn(
                        "border-border/50 flex gap-4",
                        d.courierComment && "border-b pb-2",
                      )}
                    >
                      <span>
                        <span className="text-muted-foreground">Кв: </span>
                        {d.apartment || "—"}
                      </span>
                      <span>
                        <span className="text-muted-foreground">Под: </span>
                        {d.entrance || "—"}
                      </span>
                      <span>
                        <span className="text-muted-foreground">Этаж: </span>
                        {d.floor || "—"}
                      </span>
                    </div>
                    {d.courierComment && (
                      <div>
                        <span className="text-muted-foreground mb-1 block">
                          Комментарий курьеру:
                        </span>
                        <span className="font-medium">{d.courierComment}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Блок 4: Комментарий к заказу */}
            {order.message && (
              <section className="flex flex-col gap-3">
                <h4 className="text-foreground font-medium">
                  Комментарий к заказу
                </h4>
                <div className="bg-muted rounded-xl p-4 text-sm font-medium whitespace-pre-wrap">
                  {order.message}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* БЛОК УПРАВЛЕНИЯ */}
        {!isFinalStatus && (
          <div className="bg-background z-10 flex flex-col gap-3 border-t border-black/5 p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
            <h4 className="text-foreground font-medium">Управление заказом</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="h-12 bg-green-600 text-white transition-colors hover:bg-green-700"
                disabled={isPending}
                onClick={() => handleStatusChange("completed")}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Подтвердить"
                )}
              </Button>
              <Button
                className="h-12 bg-red-600 text-white transition-colors hover:bg-red-700"
                disabled={isPending}
                onClick={() => handleStatusChange("cancelled")}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Отменить"
                )}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
