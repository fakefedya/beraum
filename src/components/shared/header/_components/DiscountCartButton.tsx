"use client";

import {
  useSyncExternalStore,
  useState,
  useActionState,
  useEffect,
} from "react";
import { Button } from "@/src/components/ui/button";
import {
  ShoppingBag,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Barcode,
} from "lucide-react";
import { useCartStore } from "@/src/hooks/use-cart-store";
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

export const DiscountCartButton = () => {
  const isClient = useIsClient();
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const [state, formAction, isPending] = useActionState(
    checkoutDiscountCartAction,
    { success: false },
  );

  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(
    (state.payload?.deliveryMethod as "pickup" | "delivery") || "pickup",
  );

  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">(
    (state.payload?.paymentMethod as "card" | "cash") || "card",
  );

  useEffect(() => {
    if (state.success) clearCart();
  }, [state.success, clearCart]);

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

  const totalSum = cartItems.reduce((acc, item) => acc + item.discountPrice, 0);

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

        {state.success ? (
          <div className="animate-in fade-in zoom-in-95 flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="mb-2 text-xl font-medium">Товары забронированы!</h4>
            <p className="text-muted-foreground text-sm">
              Наш менеджер свяжется с вами для подтверждения заказа.
            </p>
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-card text-foreground mt-8 h-12 w-full rounded-xl hover:bg-gray-200"
            >
              Закрыть
            </Button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center p-6 text-center">
            <ShoppingBag className="mb-4 size-12 opacity-20" />
            <p>Ваша корзина пуста</p>
          </div>
        ) : (
          <form
            action={formAction}
            className="flex h-full flex-col overflow-hidden"
          >
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
                  value={JSON.stringify(cartItems.map((i) => i.uniqueSku))}
                />

                {/* 0. СПИСОК ТОВАРОВ */}
                <div className="flex flex-col gap-4">
                  {cartItems.map((item) => (
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
                      <button
                        type="button"
                        onClick={() => removeItem(item.uniqueSku)}
                        className="text-muted-foreground ml-auto p-2 transition-colors outline-none hover:text-red-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}

                  <div className="mt-2 flex items-center justify-between border-t border-black/5 px-2 py-4">
                    <span className="text-muted-foreground font-medium">
                      Итого:
                    </span>
                    <span className="text-2xl font-bold">
                      {totalSum.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                </div>

                {/* 1. СПОСОБ ПОЛУЧЕНИЯ */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-medium">Способ получения</h3>
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
                          checked={deliveryMethod === key}
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
                </div>

                {/* 2. СПОСОБ ОПЛАТЫ */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-medium">Способ оплаты</h3>
                  <div className="bg-muted flex flex-col gap-1 rounded-xl p-1">
                    {(
                      Object.keys(PAYMENT_LABELS) as Array<
                        keyof typeof PAYMENT_LABELS
                      >
                    ).map((key) => (
                      <label key={key} className="cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={key}
                          className="peer sr-only"
                          checked={paymentMethod === key}
                          onChange={() => setPaymentMethod(key)}
                        />
                        <div className="peer-checked:bg-background text-muted-foreground peer-checked:text-foreground w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-all peer-checked:shadow-sm">
                          {PAYMENT_LABELS[key]}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. ДАННЫЕ ПОКУПАТЕЛЯ */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-medium">Покупатель</h3>
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

                  {/* Honeypot */}
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

            {/* ФИКСИРОВАННЫЙ ПОДВАЛ */}
            <div className="bg-background z-10 flex flex-col gap-5 border-t border-black/5 p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3">
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
                className="bg-brand hover:bg-brand/80 h-14 w-full rounded-xl text-base font-semibold text-black"
              >
                {isPending ? "Бронируем..." : "Оформить заказ"}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
};
