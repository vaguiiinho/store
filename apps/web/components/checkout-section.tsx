"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { formatCurrencyBRL } from "../lib/format";

type ShippingRegion = {
  id: ShippingRegionId;
  label: string;
  shippingCents: number;
  note: string;
};

type PaymentMethodId = "pix" | "card";
type ShippingRegionId = "capital" | "interior" | "litoral";

type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  description: string;
};

const shippingRegions: ShippingRegion[] = [
  {
    id: "capital",
    label: "Capital",
    shippingCents: 1500,
    note: "Entrega urbana com valor fixo."
  },
  {
    id: "interior",
    label: "Interior",
    shippingCents: 2300,
    note: "Valor fixo para cidades do interior."
  },
  {
    id: "litoral",
    label: "Litoral",
    shippingCents: 2900,
    note: "Cobertura inicial para regiões litorâneas."
  }
];

const paymentMethods: PaymentMethod[] = [
  {
    id: "pix",
    label: "Pix",
    description: "Fluxo pronto para instruções e confirmação via webhook."
  },
  {
    id: "card",
    label: "Cartão",
    description: "Fluxo preparado para aprovação, pendência e recusa."
  }
] as const;

export function CheckoutSection() {
  const { items, itemCount, subtotalCents, hydrated } = useCart();
  const [selectedRegionId, setSelectedRegionId] = useState<ShippingRegionId>("capital");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId>("pix");
  const [orderNote, setOrderNote] = useState<string | null>(null);

  const selectedRegion = useMemo(
    () => shippingRegions.find((region) => region.id === selectedRegionId) ?? shippingRegions[0],
    [selectedRegionId]
  );

  const totalCents = subtotalCents + selectedRegion.shippingCents;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderNote(
      `Checkout preparado para ${selectedPaymentMethod === "pix" ? "Pix" : "cartão"} com frete ${selectedRegion.label}.`
    );
  }

  if (!hydrated) {
    return (
      <div className="rounded-[28px] border border-[color:var(--border)] bg-white/70 p-6 text-sm text-muted">
        Carregando carrinho para checkout...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border border-[color:var(--border)] bg-white/70 p-6">
        <p className="text-sm font-semibold text-[#1d1712]">Seu carrinho está vazio.</p>
        <p className="mt-2 text-sm text-muted">
          Adicione um produto no catálogo antes de seguir para o checkout.
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
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
      <div className="space-y-4">
        <section id="pagamento" className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
          <h2 className="text-lg font-semibold text-[#1d1712]">Contato e endereço</h2>
          <p className="mt-2 text-sm text-muted">
            Campos preparados para o checkout como visitante e para validação no backend.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Nome completo</span>
              <input
                type="text"
                name="name"
                placeholder="Seu nome"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">E-mail</span>
              <input
                type="email"
                name="email"
                placeholder="voce@exemplo.com"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Telefone</span>
              <input
                type="tel"
                name="phone"
                placeholder="(11) 99999-9999"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">CEP</span>
              <input
                type="text"
                name="cep"
                placeholder="00000-000"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1.2fr_0.4fr_0.7fr]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Rua</span>
              <input
                type="text"
                name="street"
                placeholder="Rua, avenida..."
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Número</span>
              <input
                type="text"
                name="number"
                placeholder="123"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Complemento</span>
              <input
                type="text"
                name="complement"
                placeholder="Apto, bloco..."
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>
          </div>
        </section>

        <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
          <h2 className="text-lg font-semibold text-[#1d1712]">Frete por região</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {shippingRegions.map((region) => {
              const isSelected = region.id === selectedRegionId;

              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => setSelectedRegionId(region.id)}
                  className={`rounded-3xl border p-4 text-left transition ${
                    isSelected
                      ? "border-[color:rgba(124,79,36,0.52)] bg-[color:rgba(255,250,242,0.9)]"
                      : "border-[color:var(--border)] bg-white/80 hover:bg-white"
                  }`}
                >
                  <div className="text-sm font-semibold text-[#1e1713]">{region.label}</div>
                  <div className="mt-1 text-sm text-muted">{formatCurrencyBRL(region.shippingCents)}</div>
                  <p className="mt-3 text-xs text-muted">{region.note}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
          <h2 className="text-lg font-semibold text-[#1d1712]">Pagamento</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((method) => {
              const isSelected = method.id === selectedPaymentMethod;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`rounded-3xl border p-4 text-left transition ${
                    isSelected
                      ? "border-[color:rgba(124,79,36,0.52)] bg-[color:rgba(255,250,242,0.9)]"
                      : "border-[color:var(--border)] bg-white/80 hover:bg-white"
                  }`}
                >
                  <div className="text-sm font-semibold text-[#1e1713]">{method.label}</div>
                  <p className="mt-2 text-sm text-muted">{method.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {orderNote ? (
          <div className="rounded-[28px] border border-[color:rgba(124,79,36,0.24)] bg-white/75 p-5 text-sm text-[#3a281c]">
            {orderNote}
          </div>
        ) : null}
      </div>

      <aside className="surface-strong h-fit rounded-[28px] border border-[color:var(--border)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Resumo</p>
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={item.slug} className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1e1713]">{item.name}</h3>
                  <p className="mt-1 text-sm text-muted">{item.quantity} unidade(s)</p>
                </div>
                <span className="text-sm font-semibold text-[#1e1713]">{formatCurrencyBRL(item.priceCents * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Itens</dt>
            <dd className="font-semibold text-[#1e1713]">{itemCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold text-[#1e1713]">{formatCurrencyBRL(subtotalCents)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Frete</dt>
            <dd className="font-semibold text-[#1e1713]">{formatCurrencyBRL(selectedRegion.shippingCents)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[color:var(--border)] pt-3">
            <dt className="text-base font-medium text-[#1e1713]">Total</dt>
            <dd className="text-base font-semibold text-[#1e1713]">{formatCurrencyBRL(totalCents)}</dd>
          </div>
        </dl>

        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#1d1712] px-4 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d]"
        >
          Continuar com {selectedPaymentMethod === "pix" ? "Pix" : "cartão"}
        </button>

        <p className="mt-4 text-xs text-muted">
          Integração com backend, reserva de estoque e pagamento real entram na próxima fatia.
        </p>
      </aside>
    </form>
  );
}
