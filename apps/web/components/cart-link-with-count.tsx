"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

export function CartLinkWithCount() {
  const { itemCount, hydrated } = useCart();
  return (
    <Link
      href="/carrinho"
      className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-semibold transition hover:bg-[color:var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]"
    >
      Ver carrinho ({hydrated ? itemCount : 0})
    </Link>
  );
}
