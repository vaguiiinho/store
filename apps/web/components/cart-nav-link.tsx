"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

export function CartNavLink() {
  const { itemCount, hydrated } = useCart();
  const count = hydrated ? itemCount : 0;

  return (
    <Link
      href="/carrinho"
      aria-label={`Carrinho com ${count} item(ns)`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-white/70 text-[#33271d] transition hover:border-[color:rgba(124,79,36,0.34)] hover:bg-white"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L20.5 8H7" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
      {count > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#1d1712] px-1 text-[10px] font-bold text-white">{count > 99 ? "99+" : count}</span> : null}
    </Link>
  );
}
