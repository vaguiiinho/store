"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";
import { CartIcon } from "./icons";

export function CartNavLink() {
  const { itemCount, hydrated } = useCart();
  const count = hydrated ? itemCount : 0;

  return (
    <Link
      href="/carrinho"
      aria-label={`Carrinho com ${count} item(ns)`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-white/70 text-[#33271d] transition hover:border-[color:rgba(124,79,36,0.34)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]"
    >
      <CartIcon />
      {count > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#1d1712] px-1 text-[10px] font-bold text-white">{count > 99 ? "99+" : count}</span> : null}
    </Link>
  );
}
