"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/src/components/ui/button";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
import { useCartStore, type CartItemDTO } from "@/src/hooks/use-cart-store";
import { cn } from "@/src/lib/utils";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

interface AddToCartButtonProps {
  item: CartItemDTO;
  className?: string;
}

export const AddToCartButton = ({ item, className }: AddToCartButtonProps) => {
  const isClient = useIsClient();
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);

  if (!isClient) {
    return (
      <Button disabled className={cn("opacity-50", className)}>
        <ShoppingCart className="mr-2 size-5" />
        Загрузка...
      </Button>
    );
  }

  const isInCart = items.some((i) => i.uniqueSku === item.uniqueSku);

  if (isInCart) {
    return (
      <Button
        variant="outline"
        onClick={() => removeItem(item.uniqueSku)}
        className={cn(
          "border-brand text-foreground hover:bg-brand/10 transition-colors duration-300",
          className,
        )}
      >
        <CheckCircle2 className="text-brand-secondary-muted mr-2 size-5" />
        Убрать из корзины
      </Button>
    );
  }

  return (
    <Button
      onClick={() => addItem(item)}
      className={cn(
        "bg-brand hover:bg-brand/80 text-black transition-all duration-300 active:scale-[0.98]",
        className,
      )}
    >
      <ShoppingCart className="mr-2 size-5" />
      Добавить в корзину
    </Button>
  );
};
