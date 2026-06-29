"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createCartItem, getCartItemCount, getCartSubtotal, loadCartFromStorage, persistCartToStorage, type CartState } from "../lib/cart";
import type { FeaturedProduct } from "../lib/storefront-content";

type CartContextValue = {
  items: CartState["items"];
  itemCount: number;
  subtotalCents: number;
  hydrated: boolean;
  addItem: (product: FeaturedProduct) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadCartFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    persistCartToStorage(state);
  }, [hydrated, state]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount: getCartItemCount(state),
      subtotalCents: getCartSubtotal(state),
      hydrated,
      addItem: (product) => {
        setState((current) => {
          const existingItem = current.items.find((item) => item.slug === product.slug);

          if (existingItem) {
            return {
              items: current.items.map((item) =>
                item.slug === product.slug
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            };
          }

          return {
            items: [...current.items, createCartItem(product)]
          };
        });
      },
      removeItem: (slug) => {
        setState((current) => ({
          items: current.items.filter((item) => item.slug !== slug)
        }));
      },
      updateQuantity: (slug, quantity) => {
        setState((current) => ({
          items: current.items
            .map((item) => (item.slug === slug ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0)
        }));
      },
      clearCart: () => {
        setState({ items: [] });
      }
    }),
    [hydrated, state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
