"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BoxIcon, ChevronIcon, CloseIcon, DashboardIcon, MenuIcon, ReceiptIcon, RulerIcon, StockIcon, StoreIcon, TagIcon, UsersIcon } from "./icons";
import type { UserRole } from "../src/services/storefront-api";

type NavItem = { href: string; label: string; icon: ReactNode };

const mainItems: NavItem[] = [
  { href: "/", label: "Loja", icon: <StoreIcon /> },
  { href: "/painel", label: "Painel", icon: <DashboardIcon /> }
];

type NavGroup = { id: string; label: string; icon: ReactNode; items: NavItem[] };

const adminGroups: NavGroup[] = [
  {
    id: "catalogo",
    label: "Catálogo",
    icon: <BoxIcon />,
    items: [
      { href: "/admin/produtos", label: "Produtos", icon: <BoxIcon className="h-4 w-4" /> },
      { href: "/admin/categorias", label: "Categorias", icon: <TagIcon className="h-4 w-4" /> }
    ]
  },
  {
    id: "estoque",
    label: "Estoque",
    icon: <StockIcon />,
    items: [
      { href: "/admin/estoque", label: "Visão geral", icon: <StockIcon className="h-4 w-4" /> },
      { href: "/admin/unidades", label: "Unidades", icon: <RulerIcon className="h-4 w-4" /> }
    ]
  },
  {
    id: "vendas",
    label: "Vendas",
    icon: <ReceiptIcon />,
    items: [{ href: "/admin/pedidos", label: "Pedidos", icon: <ReceiptIcon className="h-4 w-4" /> }]
  }
];

const usersItem: NavItem = { href: "/admin/usuarios", label: "Usuários", icon: <UsersIcon /> };

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
  // Grupos de admin: o que contem a rota ativa nasce aberto; os demais comecam fechados.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(adminGroups.map((group) => [group.id, group.items.some((item) => isActive(pathname, item.href))]))
  );
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
    const activeGroup = adminGroups.find((group) => group.items.some((item) => isActive(pathname, item.href)));
    if (activeGroup) setOpenGroups((current) => (current[activeGroup.id] ? current : { ...current, [activeGroup.id]: true }));
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

  function renderItem(item: NavItem, compact = false) {
    const active = isActive(pathname, item.href);
    return (
      <li key={item.href} className={`relative ${compact && active ? "before:absolute before:-left-[13px] before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[color:var(--accent)]" : ""}`}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={`flex items-center gap-3 rounded-2xl px-3 ${compact ? "py-2" : "py-2.5"} text-sm font-medium transition ${focusRing} ${
            active
              ? "bg-[color:var(--accent-soft)] font-semibold text-[color:var(--accent-strong)]"
              : "text-muted hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--foreground)]"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      </li>
    );
  }

  function renderGroup(group: NavGroup) {
    const expanded = openGroups[group.id] ?? false;
    const containsActive = group.items.some((item) => isActive(pathname, item.href));
    const buttonId = `nav-group-btn-${group.id}`;
    const listId = `nav-group-${group.id}`;
    const highlight = containsActive && !expanded;
    return (
      <li key={group.id}>
        <button
          id={buttonId}
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setOpenGroups((current) => ({ ...current, [group.id]: !expanded }))}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition hover:bg-[color:var(--accent-soft)] ${focusRing} ${
            highlight
              ? "font-semibold text-[color:var(--accent-strong)]"
              : expanded
                ? "font-medium text-[color:var(--foreground)]"
                : "font-medium text-muted hover:text-[color:var(--foreground)]"
          }`}
        >
          {group.icon}
          <span className="flex-1 text-left">{group.label}</span>
          {highlight ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" /> : null}
          <ChevronIcon className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${expanded ? "" : "-rotate-90"}`} />
        </button>
        <div
          className={`grid transition-[grid-template-rows,visibility] duration-200 ease-out motion-reduce:transition-none ${
            expanded ? "grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
          }`}
        >
          <ul id={listId} aria-labelledby={buttonId} className="ml-5 mt-1 min-h-0 space-y-1 overflow-hidden border-l border-[color:var(--border)] pl-3">
            {group.items.map((item) => renderItem(item, true))}
          </ul>
        </div>
      </li>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      {open ? <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" /> : null}

      <aside
        id="app-sidebar"
        className={`surface fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col gap-1 border-r border-[color:var(--border)] p-4 transition-transform motion-reduce:transition-none overflow-y-auto lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-60 lg:translate-x-0 ${
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
          <ul className="space-y-1">{mainItems.map((item) => renderItem(item))}</ul>
          {role === "ADMIN" ? (
            <div className="mt-4 border-t border-[color:var(--border)] pt-4">
              <p id="nav-admin-label" className="mb-2 px-3 text-xs uppercase tracking-wide text-muted">
                Administração
              </p>
              <ul aria-labelledby="nav-admin-label" className="space-y-1">
                {adminGroups.map(renderGroup)}
                {renderItem(usersItem)}
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
