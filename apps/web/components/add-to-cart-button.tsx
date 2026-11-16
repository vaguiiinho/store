"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useCart } from "./cart-provider";
import { CartIcon, CartPlusIcon, CheckIcon } from "./icons";
import type { FeaturedProduct } from "../lib/storefront-content";

type AddToCartButtonProps = {
  product: FeaturedProduct;
  variant?: "full" | "icon";
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";

export function AddToCartButton({ product, variant = "full" }: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const availableQuantity = product.stock?.availableQuantity ?? null;
  const inCart = items.find((item) => item.slug === product.slug)?.quantity ?? 0;
  const isSoldOut = typeof availableQuantity === "number" && (availableQuantity <= 0 || inCart >= availableQuantity);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function handleClick() {
    startTransition(() => {
      addItem(product);
    });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1500);
  }

  if (variant === "icon") {
    const label = isSoldOut
      ? `${product.name}: sem estoque`
      : added
        ? `${product.name} adicionado ao carrinho`
        : `Adicionar ${product.name} ao carrinho`;
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending || isSoldOut}
          aria-label={label}
          aria-busy={isPending ? "true" : undefined}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10 ${focusRing} ${
            added && !isSoldOut
              ? "bg-[color:var(--success)] text-white"
              : "bg-[#1d1712] text-[#fffaf2] hover:bg-[#34261d]"
          }`}
        >
          {isSoldOut ? (
            <CartIcon />
          ) : added ? (
            <CheckIcon />
          ) : (
            <CartPlusIcon className={`h-5 w-5 ${isPending ? "animate-pulse motion-reduce:animate-none" : ""}`} />
          )}
        </button>
        <span className="sr-only" role="status" aria-live="polite">
          {added ? "Adicionado ao carrinho" : ""}
        </span>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d] disabled:cursor-not-allowed disabled:opacity-70 ${focusRing}`}
      disabled={isPending || isSoldOut}
    >
      {isSoldOut ? "Sem estoque" : isPending ? "Adicionando..." : added ? "Adicionado" : "Adicionar ao carrinho"}
    </button>
  );
}
