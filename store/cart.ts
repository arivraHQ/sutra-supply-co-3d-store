"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TeeColorId } from "@/tokens/theme";
import type { TeeSize } from "@/content/site";

export type PrintPlacement = "left-chest" | "center-chest" | "back";

export interface CustomPrintSpec {
  mode: "none" | "text" | "image";
  placement: PrintPlacement;
  text?: string;
  fontFamily?: string;
  textColor?: string;
  textSize?: number;
  imageName?: string;
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
  printCharge: number;
}

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  color: TeeColorId;
  size: TeeSize;
  quantity: number;
  unitPrice: number;
  printSpec?: CustomPrintSpec;
  thumbnailDataUrl?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

function buildItemKey(item: Omit<CartItem, "key">): string {
  const printPart = item.printSpec
    ? `${item.printSpec.mode}:${item.printSpec.placement}:${item.printSpec.text ?? ""}:${item.printSpec.imageName ?? ""}:${item.printSpec.offsetX.toFixed(2)}:${item.printSpec.offsetY.toFixed(2)}:${item.printSpec.scale.toFixed(2)}:${item.printSpec.rotation.toFixed(2)}`
    : "plain";
  return `${item.productId}__${item.color}__${item.size}__${printPart}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (newItem) =>
        set((state) => {
          const key = buildItemKey(newItem);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.key === key
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i,
              ),
            };
          }
          return {
            isOpen: true,
            items: [...state.items, { ...newItem, key }],
          };
        }),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) =>
                  i.key === key ? { ...i, quantity } : i,
                ),
        })),
      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((i) => i.key !== key),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "sutra-cart-v1",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
