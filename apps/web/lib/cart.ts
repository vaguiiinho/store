import type { FeaturedProduct } from "./storefront-content";

export type CartItem = FeaturedProduct & {
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};

const CART_STORAGE_KEY = "loja-ritual-cart";

export function createCartItem(product: FeaturedProduct, quantity = 1): CartItem {
  return {
    ...product,
    quantity
  };
}

export function loadCartFromStorage() {
  if (typeof window === "undefined") {
    return { items: [] } satisfies CartState;
  }

  const rawValue = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!rawValue) {
    return { items: [] } satisfies CartState;
  }

  try {
    const parsed = JSON.parse(rawValue) as CartState;

    if (!parsed || !Array.isArray(parsed.items)) {
      return { items: [] } satisfies CartState;
    }

    return {
      items: parsed.items.filter(
        (item): item is CartItem =>
          typeof item.slug === "string" &&
          typeof item.name === "string" &&
          typeof item.priceCents === "number" &&
          typeof item.quantity === "number" &&
          item.quantity > 0
      )
    } satisfies CartState;
  } catch {
    return { items: [] } satisfies CartState;
  }
}

export function persistCartToStorage(state: CartState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
}

export function getCartItemCount(state: CartState) {
  return state.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(state: CartState) {
  return state.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}
