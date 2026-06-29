"use client";

import { useTransition } from "react";
import { useCart } from "./cart-provider";
import type { FeaturedProduct } from "../lib/storefront-content";

type AddToCartButtonProps = {
  product: FeaturedProduct;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          addItem(product);
        });
      }}
      className="rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d] disabled:cursor-not-allowed disabled:opacity-70"
      disabled={isPending}
    >
      {isPending ? "Adicionando..." : "Adicionar ao carrinho"}
    </button>
  );
}
