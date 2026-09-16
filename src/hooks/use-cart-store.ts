import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

export type CartItemDTO = {
  uniqueSku: string;
  siteArticle: string;
  categoryName: string;
  discountPrice: number;
  imageUrl: string;
};

interface CartState {
  items: CartItemDTO[];
  addItem: (item: CartItemDTO) => void;
  removeItem: (uniqueSku: string) => void;
  clearCart: () => void;
}

const MAX_CART_ITEMS = 3;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        if (items.some((i) => i.uniqueSku === item.uniqueSku)) {
          return; // Уже в корзине
        }
        if (items.length >= MAX_CART_ITEMS) {
          toast.error(`Корзина переполнена`, {
            description: `Можно добавить не более ${MAX_CART_ITEMS} уникальных товаров за один заказ.`,
          });
          return;
        }
        set({ items: [...items, item] });
        toast.success("Товар добавлен в корзину");
      },

      removeItem: (uniqueSku) => {
        set({ items: get().items.filter((i) => i.uniqueSku !== uniqueSku) });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "beraum-discount-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
