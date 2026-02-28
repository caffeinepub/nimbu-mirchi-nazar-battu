import { create } from "zustand";
import type { Product } from "../mocks/backend";

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderType = "OneTime" | "Subscription";
export type PaymentMethod = "Stripe" | "COD";

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  paymentMethod: PaymentMethod;

  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: bigint) => void;
  updateQuantity: (productId: bigint, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setPaymentMethod: (method: PaymentMethod) => void;

  // Computed
  totalItems: () => number;
  totalAmount: () => bigint;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: "OneTime",
  paymentMethod: "Stripe",

  addItem: (product: Product) => {
    set((state) => {
      const existing = state.items.find(
        (item) => item.product.id === product.id,
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    });
  },

  removeItem: (productId: bigint) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId: bigint, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  setOrderType: (type: OrderType) => set({ orderType: type }),

  setPaymentMethod: (method: PaymentMethod) => set({ paymentMethod: method }),

  totalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  totalAmount: () => {
    return get().items.reduce(
      (sum, item) => sum + item.product.price * BigInt(item.quantity),
      0n,
    );
  },
}));
