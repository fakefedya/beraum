"use client";

import { useSyncExternalStore, useState, useActionState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  ShoppingBag,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Barcode,
  Info,
} from "lucide-react";
import { useCartStore, type CartItemDTO } from "@/src/hooks/use-cart-store";
import { cn } from "@/src/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { SafeImage } from "../../SafeImage";
import { FloatingField } from "../../FloatingField";
import { Checkbox } from "@/src/components/ui/checkbox";
import { checkoutDiscountCartAction } from "@/src/server/actions/discount";
import { DELIVERY_LABELS, PAYMENT_LABELS } from "@/src/lib/constants";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
type CheckoutState = Awaited<ReturnType<typeof checkoutDiscountCartAction>>;

const CartFormContent = ({
  items,
  onClose,
}: {
  items: CartItemDTO[];
  onClose: () => void;
}) => {
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState<string>();

  const [state, formAction, isPending] = useActionState(
    async (prevState: CheckoutState, formData: FormData) => {
      const res = await checkoutDiscountCartAction(prevState, formData);

      if (res.success) {
        clearCart();
      }

      return res;
    },
    { success: false } as CheckoutState,
  );

  if (state.success) {
    return (
      <div className="animate-in fade-in zoom-in-95 flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h4 className="mb-2 text-xl font-medium">Товары забронированы!</h4>
        <p className="text-muted-foreground text-sm">
          Наш менеджер свяжется с вами для подтверждения заказа.
        </p>
        <Button
          onClick={onClose}
          className="bg-card text-foreground mt-8 h-12 w-full rounded-xl transition-colors hover:bg-gray-200"
        >
          Закрыть
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full flex-col items-center justify-center p-6 text-center">
        <ShoppingBag className="mb-4 size-12 opacity-20" />
        <p>Ваша корзина пуста</p>
      </div>
    );
  }

  const totalSum = items.reduce((acc, item) => acc + item.discountPrice, 0);

  return (
    <form action={formAction} className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 scrollbar-thin overflow-y-auto px-6 pb-6">
        <div className="flex flex-col gap-8 pt-4">
          {state.error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{state.error}</p>
            </div>
          )}

          <input
            type="hidden"
            name="skus"
            value={JSON.stringify(items.map((i) => i.uniqueSku))}
          />

          {/* 0. СПИСОК ТОВАРОВ */}
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.uniqueSku}
                className="bg-card flex items-center gap-4 rounded-2xl p-3"
              >
                <div className="bg-accent relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.uniqueSku}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <span className="text-muted-foreground truncate text-xs">
                    {item.categoryName}
                  </span>
                  <span className="text-foreground truncate font-medium uppercase">
                    {item.siteArticle}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1 truncate font-mono text-xs">
                    <Barcode size={14} />
                    {item.uniqueSku}
                  </span>
                  <span className="text-foreground mt-1 text-sm font-medium">
                    {item.discountPrice.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() => removeItem(item.uniqueSku)}
                  className="text-foreground ml-auto bg-transparent p-2 transition-colors outline-none hover:bg-transparent hover:text-red-500"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            <div className="mt-4 flex items-center justify-between border-t border-black/5 py-4">
              <span className="font-medium">Итого:</span>
              <span className="text-lg font-medium">
                {totalSum.toLocaleString("ru-RU")} ₽
              </span>
            </div>
          </div>

          {/* 1. СПОСОБ ПОЛУЧЕНИЯ */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium">
              Как вы хотите получить заказ?
            </h3>
            <div className="bg-muted flex gap-1 rounded-xl p-1">
              {(
                Object.keys(DELIVERY_LABELS) as Array<
                  keyof typeof DELIVERY_LABELS
                >
              ).map((key) => (
                <label key={key} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={key}
                    className="peer sr-only"
                    defaultChecked={deliveryMethod === key}
                    onChange={() => setDeliveryMethod(key)}
                  />
                  <div className="peer-checked:bg-background text-muted-foreground peer-checked:text-foreground rounded-lg py-2.5 text-center text-sm font-medium transition-all peer-checked:shadow-sm">
                    {DELIVERY_LABELS[key]}
                  </div>
                </label>
              ))}
            </div>

            {deliveryMethod === "delivery" && (
              <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-4 pt-2">
                <div className="bg-card flex items-start gap-3 rounded-xl p-4">
                  <Info
                    className="text-muted-foreground mt-0.5 size-5 shrink-0"
                    strokeWidth={2}
                  />
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Стоимость и сроки доставки сообщит наш менеджер при
                    подтверждении заказа.
                  </p>
                </div>
                <h3 className="mt-4 text-lg font-medium">
                  Куда нам отправить ваш заказ?
                </h3>
                <FloatingField
                  name="address"
                  label="Адрес (Улица, дом)"
                  disabled={isPending}
                  error={state.fieldErrors?.address}
                  defaultValue={state.payload?.address as string}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FloatingField
                    name="apartment"
                    label="Квартира"
                    isRequired={false}
                    disabled={isPending}
                    defaultValue={state.payload?.apartment as string}
                  />
                  <FloatingField
                    name="entrance"
                    label="Подъезд"
                    isRequired={false}
                    disabled={isPending}
                    defaultValue={state.payload?.entrance as string}
                  />
                  <FloatingField
                    name="floor"
                    label="Этаж"
                    isRequired={false}
                    disabled={isPending}
                    defaultValue={state.payload?.floor as string}
                  />
                  <FloatingField
                    name="intercom"
                    label="Домофон"
                    isRequired={false}
                    disabled={isPending}
                    defaultValue={state.payload?.intercom as string}
                  />
                </div>
                <FloatingField
                  name="courierComment"
                  label="Комментарий курьеру"
                  isTextarea
                  isRequired={false}
                  disabled={isPending}
                  defaultValue={state.payload?.courierComment as string}
                />
              </div>
            )}

            {deliveryMethod === "pickup" && (
              <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-4 pt-2">
                <div className="bg-card flex items-start gap-3 rounded-xl p-4">
                  <Info
                    className="text-muted-foreground mt-0.5 size-5 shrink-0"
                    strokeWidth={2}
                  />
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Самовывоз осуществляется по адресу: Россия, Санкт-Петербург,
                    посёлок Парголово, Тихоокеанская улица, дом 18, корпус 4.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. СПОСОБ ОПЛАТЫ */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium">
              Как вам удобнее оплатить заказ?
            </h3>
            <div className="flex flex-col gap-4">
              {(
                Object.keys(PAYMENT_LABELS) as Array<
                  keyof typeof PAYMENT_LABELS
                >
              ).map((key) => (
                <label key={key} className="w-full cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={key}
                    className="peer sr-only"
                    defaultChecked={paymentMethod === key}
                    onChange={() => setPaymentMethod(key)}
                  />
                  <div
                    className={cn(
                      "border-ring/30 flex flex-col gap-15 rounded-2xl border p-4 font-medium",
                      "hover:border-muted-foreground transition-all duration-200",
                      "peer-checked:border-brand-secondary peer-checked:hover:border-brand-secondary peer-focus-visible:ring-brand-secondary peer-checked:ring-brand-secondary peer-checked:bg-transparent peer-checked:ring-1 peer-focus-visible:ring-2",
                      state.fieldErrors?.paymentMethod &&
                        !paymentMethod &&
                        "border-red-500 bg-[#fff2f4] hover:border-red-500",
                    )}
                  >
                    {PAYMENT_LABELS[key]}
                    <span
                      className={cn("text-sm font-normal transition-colors")}
                    >
                      Оплата производится при получении заказа.
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {state.fieldErrors?.paymentMethod && !paymentMethod && (
              <div className="flex items-center gap-1.5 px-1 text-xs font-medium text-red-500">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{state.fieldErrors.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* 3. ДАННЫЕ ПОКУПАТЕЛЯ */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium">Персональная информация</h3>
            <FloatingField
              name="name"
              label="ФИО"
              disabled={isPending}
              error={state.fieldErrors?.name}
              defaultValue={state.payload?.name as string}
            />
            <FloatingField
              name="phone"
              label="Телефон"
              type="tel"
              disabled={isPending}
              error={state.fieldErrors?.phone}
              defaultValue={state.payload?.phone as string}
            />
            <FloatingField
              name="email"
              label="Электронная почта"
              type="email"
              disabled={isPending}
              error={state.fieldErrors?.email}
              defaultValue={state.payload?.email as string}
            />
            <FloatingField
              name="message"
              label="Комментарий к заказу"
              isTextarea
              isRequired={false}
              disabled={isPending}
              error={state.fieldErrors?.message}
              defaultValue={state.payload?.message as string}
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-[-9999px] opacity-0"
            >
              <input
                type="text"
                name="botCheck"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background z-10 flex flex-col gap-5 rounded-br-4xl rounded-bl-4xl border-t border-black/5 p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Checkbox
              id="cart-consent"
              name="consent"
              value="on"
              disabled={isPending}
              defaultChecked={state.payload?.consent === "on"}
              className="shrink-0"
            />
            <label
              htmlFor="cart-consent"
              className="text-foreground/80 cursor-pointer text-xs"
            >
              Я даю согласие на{" "}
              <a
                href="/policies/consent"
                target="_blank"
                className="text-brand-secondary-muted hover:underline"
              >
                обработку персональных данных
              </a>
            </label>
          </div>
          {state.fieldErrors?.consent && (
            <div className="flex items-center gap-1.5 px-1 text-xs font-medium text-red-500">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{state.fieldErrors.consent}</span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="bg-brand hover:bg-brand/80 text-foreground h-14 w-full rounded-xl text-base font-medium"
        >
          {isPending ? "Бронируем..." : "Оформить заказ"}
        </Button>
      </div>
    </form>
  );
};

export const DiscountCartButton = () => {
  const isClient = useIsClient();
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  if (!isClient) {
    return (
      <Button
        disabled
        className="bg-brand text-foreground relative h-12 w-12 rounded-[16px] opacity-50"
      >
        <ShoppingBag className="size-5" />
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className={cn(
            "bg-brand text-foreground relative h-12 w-12 rounded-[16px] transition-all duration-300",
            "hover:bg-brand-hover active:scale-[0.96]",
            "outline-none focus-visible:ring-2 focus-visible:ring-black",
          )}
          aria-label={`Корзина, товаров: ${cartItems.length}`}
        >
          <ShoppingBag className="size-5" />
          {cartItems.length > 0 && (
            <span className="bg-background shadow-nav absolute right-0 bottom-0 flex h-6 min-w-6 items-center justify-center rounded-full p-1 text-xs leading-none font-medium">
              {cartItems.length}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        className={cn(
          "flex h-dvh w-full flex-col gap-0 border-none p-0",
          "sm:max-w-md",
          "md:inset-y-4 md:right-4 md:h-[calc(100dvh-32px)] md:rounded-4xl",
        )}
      >
        <SheetHeader className="p-6 text-left">
          <SheetTitle className="text-xl">Оформление заказа</SheetTitle>
        </SheetHeader>

        {/* Условный рендеринг: при isOpen === false компонент умирает вместе с его стейтом */}
        {isOpen && (
          <CartFormContent items={cartItems} onClose={() => setIsOpen(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
};
