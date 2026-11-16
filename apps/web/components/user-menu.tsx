"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { logoutAction } from "../app/actions/storefront-actions";
import { CART_STORAGE_KEY } from "../lib/cart";
import { LogoutIcon, UserIcon } from "./icons";
import type { SessionUser } from "../src/services/storefront-api";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";
const itemClass = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted transition hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--foreground)] ${focusRing}`;

export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function items() {
    return Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);
  }

  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onFocusOut(event: FocusEvent) {
      const next = event.relatedTarget as Node | null;
      if (next && !rootRef.current?.contains(next)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    const root = rootRef.current;
    root?.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      root?.removeEventListener("focusout", onFocusOut);
    };
  }, [open]);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (!open || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;
    event.preventDefault();
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const nextIndex = event.key === "ArrowDown" ? (index + 1) % list.length : (index - 1 + list.length) % list.length;
    list[nextIndex]?.focus();
  }

  function logout() {
    startTransition(async () => {
      await logoutAction();
      try {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      } catch {
        /* storage indisponivel */
      }
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Menu do usuário"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-menu-panel"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-white/70 text-[#33271d] transition hover:bg-white ${focusRing}`}
      >
        <UserIcon />
      </button>
      {open ? (
        <div
          ref={panelRef}
          id="user-menu-panel"
          role="menu"
          aria-label="Menu do usuário"
          className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-2 shadow-[0_20px_60px_rgba(50,31,14,0.16)]"
        >
          <div className="px-3 py-2">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              {user.role === "ADMIN" ? (
                <span className="rounded-full bg-[color:var(--accent-soft)] px-2 py-0.5 text-xs text-[color:var(--accent-strong)]">Admin</span>
              ) : null}
            </div>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <Link role="menuitem" href="/pedidos" className={itemClass} onClick={() => setOpen(false)}>
            Meus pedidos
          </Link>
          <Link role="menuitem" href="/conta" className={itemClass} onClick={() => setOpen(false)}>
            Minha conta
          </Link>
          <button role="menuitem" type="button" disabled={pending} onClick={logout} className={`${itemClass} disabled:opacity-60`}>
            <LogoutIcon className="h-4 w-4" />
            {pending ? "Saindo..." : "Sair"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
