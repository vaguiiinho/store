"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";
import { formatCurrencyBRL } from "../lib/format";

type ShippingRegionId = "capital" | "interior" | "litoral";
type PaymentMethodId = "pix" | "card";
type PaymentApiValue = "PIX" | "CARD";

type ShippingRegion = {
  id: ShippingRegionId;
  label: string;
  shippingCents: number;
  note: string;
};

type PaymentMethod = {
  id: PaymentMethodId;
  apiValue: PaymentApiValue;
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
    apiValue: "PIX",
    label: "Pix",
    description: "Fluxo pronto para instruções e confirmação via webhook."
  },
  {
    id: "card",
    apiValue: "CARD",
    label: "Cartão",
    description: "Fluxo preparado para aprovação, pendência e recusa."
  }
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export function CheckoutSection() {
  const router = useRouter();
  const { items, itemCount, subtotalCents, hydrated, clearCart } = useCart();
  const [selectedRegionId, setSelectedRegionId] = useState<ShippingRegionId>("capital");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId>("pix");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRegion = useMemo(
    () => shippingRegions.find((region) => region.id === selectedRegionId) ?? shippingRegions[0],
    [selectedRegionId]
  );
  const selectedPayment = paymentMethods.find((method) => method.id === selectedPaymentMethod) ?? paymentMethods[0];

  const totalCents = subtotalCents + selectedRegion.shippingCents;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload = {
      customer: {
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim() || null,
        phone: String(formData.get("phone") ?? "").trim(),
        document: String(formData.get("document") ?? "").trim() || null
      },
      shippingAddress: {
        cep: String(formData.get("cep") ?? "").trim(),
        street: String(formData.get("street") ?? "").trim(),
        number: String(formData.get("number") ?? "").trim(),
        complement: String(formData.get("complement") ?? "").trim() || null,
        district: String(formData.get("district") ?? "").trim(),
        city: String(formData.get("city") ?? "").trim(),
        state: String(formData.get("state") ?? "").trim(),
        reference: String(formData.get("reference") ?? "").trim() || null
      },
      shippingRegion: selectedRegionId,
      paymentMethod: selectedPayment.apiValue,
      items: items.map((item) => ({
        productSlug: item.slug,
        quantity: item.quantity
      }))
    };

    try {
      setIsSubmitting(true);
      setFeedback(null);

      const response = await fetch(`${apiBaseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const body = (await response.json()) as {
        number?: string;
        totalCents?: number;
        payment?: {
          provider?: string | null;
          checkoutUrl?: string | null;
          qrCodeText?: string | null;
          qrCodeBase64?: string | null;
          instructions?: string[];
          expiresAt?: string | null;
        } | null;
        message?: string | string[];
      };

      if (!response.ok) {
        const message = Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message ?? "Nao foi possivel criar o pedido.";

        throw new Error(message);
      }

      clearCart();
      event.currentTarget.reset();
      router.push(`/pedido/${body.number}`);
      return;
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "Falha ao criar o pedido."
      });
    } finally {
      setIsSubmitting(false);
    }
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
                required
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">E-mail</span>
              <input
                type="email"
                name="email"
                placeholder="voce@exemplo.com"
                required
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Telefone</span>
              <input
                type="tel"
                name="phone"
                placeholder="(11) 99999-9999"
                required
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Documento</span>
              <input
                type="text"
                name="document"
                placeholder="CPF opcional"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">CEP</span>
              <input
                type="text"
                name="cep"
                placeholder="00000-000"
                required
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

          <div className="mt-4 grid gap-4 sm:grid-cols-[1.2fr_0.4fr_0.7fr]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Rua</span>
              <input
                type="text"
                name="street"
                placeholder="Rua, avenida..."
                required
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Número</span>
              <input
                type="text"
                name="number"
                placeholder="123"
                required
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Referência</span>
              <input
                type="text"
                name="reference"
                placeholder="Perto de..."
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Distrito</span>
              <input
                type="text"
                name="district"
                placeholder="Bairro"
                required
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Cidade</span>
              <input
                type="text"
                name="city"
                placeholder="Cidade"
                required
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[0.35fr_1fr]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">UF</span>
              <input
                type="text"
                name="state"
                placeholder="SP"
                required
                maxLength={2}
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm uppercase text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
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

        {feedback ? (
          <div
            className={`rounded-[28px] border p-5 text-sm ${
              feedback.kind === "success"
                ? "border-[color:rgba(124,79,36,0.24)] bg-white/75 text-[#3a281c]"
                : "border-[color:rgba(153,27,27,0.24)] bg-[color:rgba(254,242,242,0.8)] text-[#7f1d1d]"
            }`}
          >
            {feedback.message}
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
                <span className="text-sm font-semibold text-[#1e1713]">
                  {formatCurrencyBRL(item.priceCents * item.quantity)}
                </span>
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
          disabled={isSubmitting}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#1d1712] px-4 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Enviando pedido..." : `Continuar com ${selectedPayment.label}`}
        </button>

        <p className="mt-4 text-xs text-muted">
          Integração com backend, reserva de estoque e pagamento real entram na próxima fatia.
        </p>
      </aside>
    </form>
  );
}
