"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCart } from "./cart-provider";
import { BoxIcon, CartIcon, CloseIcon, DashboardIcon, MenuIcon, ReceiptIcon, StoreIcon, UsersIcon } from "./icons";
import type { UserRole } from "../src/services/storefront-api";

type NavItem = { href: string; label: string; icon: ReactNode; badge?: boolean };

const mainItems: NavItem[] = [
  { href: "/", label: "Loja", icon: <StoreIcon /> },
  { href: "/painel", label: "Painel", icon: <DashboardIcon /> },
  { href: "/carrinho", label: "Carrinho", icon: <CartIcon />, badge: true }
];

const adminItems: NavItem[] = [
  { href: "/admin/produtos", label: "Produtos", icon: <BoxIcon /> },
  { href: "/admin/pedidos", label: "Pedidos", icon: <ReceiptIcon /> },
  { href: "/admin/usuarios", label: "Usuários", icon: <UsersIcon /> }
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/produto/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AppSidebarProps = {
  role: UserRole;
  /** Controles da direita da topbar (carrinho, tema, menu do usuario), renderizados no servidor. */
  topbarActions: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

/** Moldura do shell: sidebar fixa no desktop, drawer no mobile (o gatilho fica na topbar) e coluna de conteudo. */
export function AppSidebar({ role, topbarActions, footer, children }: AppSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { itemCount, hydrated } = useCart();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = hydrated ? itemCount : 0;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function renderItem(item: NavItem) {
    const active = isActive(pathname, item.href);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${focusRing} ${
            active
              ? "bg-[color:var(--accent-soft)] font-semibold text-[color:var(--accent-strong)]"
              : "text-muted hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--foreground)]"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
          {item.badge && count > 0 ? (
            <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-bold text-[color:var(--background)]">
              {count > 99 ? "99+" : count}
            </span>
          ) : null}
        </Link>
      </li>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      {open ? <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" /> : null}

      <aside
        id="app-sidebar"
        className={`surface fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col gap-1 border-r border-[color:var(--border)] p-4 transition-transform motion-reduce:transition-none lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-60 lg:translate-x-0 ${
          open ? "translate-x-0" : ""
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <Link href="/" className={`text-lg font-semibold ${focusRing}`}>
            Loja Virtual
          </Link>
          <button
            ref={closeRef}
            type="button"
            aria-label="Fechar menu"
            onClick={() => {
              setOpen(false);
              toggleRef.current?.focus();
            }}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden ${focusRing}`}
          >
            <CloseIcon />
          </button>
        </div>
        <nav aria-label="Navegação principal">
          <ul className="space-y-1">{mainItems.map(renderItem)}</ul>
          {role === "ADMIN" ? (
            <div className="mt-4 border-t border-[color:var(--border)] pt-4">
              <p id="nav-admin-label" className="mb-2 px-3 text-xs uppercase tracking-wide text-muted">
                Administração
              </p>
              <ul aria-labelledby="nav-admin-label" className="space-y-1">
                {adminItems.map(renderItem)}
              </ul>
            </div>
          ) : null}
        </nav>
      </aside>
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[color:var(--border)] bg-[color:var(--surface)] px-4 backdrop-blur">
          <button
            ref={toggleRef}
            type="button"
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls="app-sidebar"
            onClick={() => setOpen(true)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-white/70 text-[#33271d] lg:hidden ${focusRing}`}
          >
            <MenuIcon />
          </button>
          <Link href="/" className={`text-base font-semibold lg:hidden ${focusRing}`}>
            Loja Virtual
          </Link>
          <div className="ml-auto flex items-center gap-2">{topbarActions}</div>
        </header>
        <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
        {footer}
      </div>
    </div>
  );
}
