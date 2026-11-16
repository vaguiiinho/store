"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { logoutAction } from "../app/actions/storefront-actions";
import { CART_STORAGE_KEY } from "../lib/cart";
import type { SessionUser } from "../src/services/storefront-api";

const itemClass = "block rounded-xl px-3 py-2 text-sm hover:bg-white/10";

export function AuthNav({ user }: { user: SessionUser | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!user) {
    return <Link href="/login" className="rounded-full bg-[#1d1712] px-4 py-2 text-sm font-semibold text-white">Entrar</Link>;
  }

  function logout() {
    startTransition(async () => {
      await logoutAction();
      try { window.localStorage.removeItem(CART_STORAGE_KEY); } catch { /* storage indisponivel */ }
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)} className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold">
        {user.name.split(" ")[0] || user.email.split("@")[0]}
        {user.role === "ADMIN" ? <span className="ml-2 rounded-full bg-[color:var(--accent-soft)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] accent-text">admin</span> : null}
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-full z-50 mt-3 w-52 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-2 shadow-xl">
          <p className="truncate px-3 py-2 text-xs text-muted">{user.email}</p>
          <Link role="menuitem" href="/pedidos" className={itemClass}>Meus pedidos</Link>
          <Link role="menuitem" href="/conta" className={itemClass}>Minha conta</Link>
          {user.role === "ADMIN" ? (
            <>
              <Link role="menuitem" href="/admin" className={itemClass}>Painel admin</Link>
              <Link role="menuitem" href="/admin/usuarios" className={itemClass}>Usuários</Link>
            </>
          ) : null}
          <button role="menuitem" type="button" disabled={pending} onClick={logout} className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-500 hover:bg-white/10">
            {pending ? "Saindo..." : "Sair"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
