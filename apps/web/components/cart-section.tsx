"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";
import { formatCurrencyBRL } from "../lib/format";

export function CartSection() {
  const { items, itemCount, subtotalCents, hydrated, removeItem, updateQuantity, clearCart } = useCart();
  const shippingCents = items.length > 0 ? 2300 : 0;
  const totalCents = subtotalCents + shippingCents;

  if (!hydrated) {
    return (
      <div className="rounded-[28px] border border-[color:var(--border)] bg-white/70 p-6 text-sm text-muted">
        Carregando carrinho...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border border-[color:var(--border)] bg-white/70 p-6">
        <p className="text-sm font-semibold text-[#1d1712]">Seu carrinho está vazio.</p>
        <p className="mt-2 text-sm text-muted">
          Adicione um produto no catálogo para testar o fluxo completo.
        </p>
        <Link
          href="/catalogo"
          className="mt-5 inline-flex rounded-full bg-[#1d1712] px-4 py-3 text-sm font-semibold text-[#fffaf2]"
        >
          Ir para o catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
      <section className="space-y-4">
        <div className="rounded-[28px] border border-[color:var(--border)] bg-white/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1d1712]">Itens no carrinho</h2>
              <p className="text-sm text-muted">{itemCount} item(ns) selecionado(s)</p>
            </div>
            <button
              type="button"
              onClick={clearCart}
              className="rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/80 px-4 py-2 text-sm font-semibold text-[#3a281c]"
            >
              Limpar carrinho
            </button>
          </div>
        </div>

        {items.map((item) => (
          <article
            key={item.slug}
            className="surface-strong flex flex-col gap-4 rounded-[28px] border border-[color:var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#1d1712]">{item.name}</h3>
                <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] accent-text">
                  {item.badge}
                </span>
              </div>
              <p className="text-sm text-muted">{item.note}</p>
              <p className="text-sm text-[#33251b]">{formatCurrencyBRL(item.priceCents)} por unidade</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center overflow-hidden rounded-full border border-[color:rgba(124,79,36,0.18)] bg-white/80">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                  className="px-4 py-2 text-sm font-semibold text-[#36261b]"
                  aria-label={`Diminuir quantidade de ${item.name}`}
                >
                  -
                </button>
                <span className="min-w-12 px-4 py-2 text-center text-sm font-semibold text-[#1e1713]">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                  className="px-4 py-2 text-sm font-semibold text-[#36261b]"
                  aria-label={`Aumentar quantidade de ${item.name}`}
                >
                  +
                </button>
              </div>
              <span className="text-sm font-semibold text-[#1e1713]">
                {formatCurrencyBRL(item.priceCents * item.quantity)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.slug)}
                className="rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/75 px-4 py-2 text-sm font-semibold text-[#3a281c]"
              >
                Remover
              </button>
            </div>
          </article>
        ))}
      </section>

      <aside className="surface-strong h-fit rounded-[28px] border border-[color:var(--border)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Totais</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold text-[#1e1713]">{formatCurrencyBRL(subtotalCents)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Frete</dt>
            <dd className="font-semibold text-[#1e1713]">{formatCurrencyBRL(shippingCents)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[color:var(--border)] pt-3">
            <dt className="text-base font-medium text-[#1e1713]">Total</dt>
            <dd className="text-base font-semibold text-[#1e1713]">{formatCurrencyBRL(totalCents)}</dd>
          </div>
        </dl>

        <Link
          href="/checkout"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#1d1712] px-4 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d]"
        >
          Finalizar compra
        </Link>
      </aside>
    </div>
  );
}
