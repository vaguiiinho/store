"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createOrderAction } from "../app/actions/storefront-actions";
import { formatCurrencyBRL } from "../lib/format";
import { useCart } from "./cart-provider";
import { CartIcon, CloseIcon } from "./icons";

type ShippingRegionId = "capital" | "interior" | "litoral";
type PaymentMethodId = "PIX" | "CARD";

// Espelha shippingTable de create-order.use-case.ts. O servidor recalcula e e a autoridade.
const shippingRegions: Array<{ id: ShippingRegionId; label: string; shippingCents: number }> = [
  { id: "capital", label: "Capital", shippingCents: 1500 },
  { id: "interior", label: "Interior", shippingCents: 2300 },
  { id: "litoral", label: "Litoral", shippingCents: 2900 }
];

const paymentMethods: Array<{ id: PaymentMethodId; label: string }> = [
  { id: "PIX", label: "Pix" },
  { id: "CARD", label: "Cartão" }
];

// Chave interna mantida para nao perder dados ja salvos.
const CHECKOUT_STORAGE_KEY = "loja-ritual-checkout";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";
const inputClass = `w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] disabled:opacity-60`;
const iconButton = `inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-white/70 text-[#33271d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
const primaryButton = `inline-flex w-full items-center justify-center rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d] disabled:cursor-not-allowed disabled:opacity-70 ${focusRing}`;
const cardClass = "surface rounded-[28px] p-5";

function Field({ label, name, defaultValue, ...rest }: { label: string; name: string; defaultValue: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold">{label}</span>
      <input name={name} defaultValue={defaultValue} className={inputClass} {...rest} />
    </label>
  );
}

export function CartSection({ loggedEmail }: { loggedEmail?: string }) {
  const router = useRouter();
  const { items, subtotalCents, hydrated, removeItem, updateQuantity, clearCart } = useCart();
  const [regionId, setRegionId] = useState<ShippingRegionId | null>(null);
  const [payment, setPayment] = useState<PaymentMethodId>("PIX");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    try {
      setSaved(JSON.parse(window.localStorage.getItem(CHECKOUT_STORAGE_KEY) ?? "{}") as Record<string, string>);
    } catch {
      setSaved({});
    }
  }, []);

  const region = shippingRegions.find((entry) => entry.id === regionId) ?? null;
  const shippingCents = region?.shippingCents ?? null;
  const totalCents = subtotalCents + (shippingCents ?? 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!region) {
      setError("Escolha a região de entrega.");
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    const text = (key: string) => String(data.get(key) ?? "").trim();
    window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(Object.fromEntries(Array.from(data.entries()).map(([key, value]) => [key, String(value)]))));

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await createOrderAction({
        customer: { name: text("name"), email: text("email") || null, phone: text("phone"), document: text("document") || null },
        shippingAddress: {
          cep: text("cep"),
          street: text("street"),
          number: text("number"),
          complement: text("complement") || null,
          district: text("district"),
          city: text("city"),
          state: text("state"),
          reference: text("reference") || null
        },
        shippingRegion: region.id,
        paymentMethod: payment,
        items: items.map((item) => ({ productSlug: item.slug, quantity: item.quantity }))
      });
      if (!response.ok || !response.data) throw new Error(response.ok ? "Nao foi possivel criar o pedido." : response.message);
      clearCart();
      router.replace(`/pedido/${response.data.number}?criado=1`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao criar o pedido.");
      setIsSubmitting(false);
    }
  }

  if (!hydrated || saved === null) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]" aria-busy="true">
        <div className="surface h-48 animate-pulse rounded-[28px] motion-reduce:animate-none" />
        <div className="surface h-48 animate-pulse rounded-[28px] motion-reduce:animate-none" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${cardClass} flex flex-col items-center gap-4 py-12 text-center`}>
        <CartIcon className="h-12 w-12 text-muted" />
        <p className="text-lg font-semibold">Seu carrinho está vazio</p>
        <Link href="/" className={`${primaryButton} w-auto`}>
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      <fieldset disabled={isSubmitting} className="min-w-0 space-y-4 border-0 p-0">
        {error ? (
          <div role="alert" className="rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4 text-sm text-[color:var(--danger)]">
            {error}
          </div>
        ) : null}

        <section className={cardClass} aria-labelledby="cart-items-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="cart-items-title" className="text-lg font-semibold">Itens</h2>
            <button type="button" onClick={clearCart} className={`rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold ${focusRing}`}>
              Limpar carrinho
            </button>
          </div>
          <ul className="mt-4 divide-y divide-[color:var(--border)]">
            {items.map((item) => {
              const max = item.stock?.availableQuantity;
              const atLimit = typeof max === "number" && item.quantity >= max;
              return (
                <li key={item.slug} className="flex flex-wrap items-center gap-4 py-3">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                  ) : (
                    <div className="grid-dots h-14 w-14 rounded-2xl" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.name}</p>
                    <p className="text-sm text-muted tabular-nums">{formatCurrencyBRL(item.priceCents)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateQuantity(item.slug, item.quantity - 1)} className={iconButton} aria-label={`Diminuir quantidade de ${item.name}`}>
                      <span aria-hidden="true">-</span>
                    </button>
                    <span aria-live="polite" className="min-w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.slug, item.quantity + 1)} disabled={atLimit} className={iconButton} aria-label={`Aumentar quantidade de ${item.name}`}>
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                  <span className="w-24 text-right text-sm font-semibold tabular-nums">{formatCurrencyBRL(item.priceCents * item.quantity)}</span>
                  <button type="button" onClick={() => removeItem(item.slug)} className={iconButton} aria-label={`Remover ${item.name}`}>
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={cardClass} aria-labelledby="cart-delivery-title">
          <h2 id="cart-delivery-title" className="text-lg font-semibold">Contato e entrega</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" name="name" defaultValue={saved.name ?? ""} autoComplete="name" required />
            <Field label="E-mail" name="email" type="email" defaultValue={saved.email ?? loggedEmail ?? ""} autoComplete="email" required />
            <Field label="Telefone" name="phone" type="tel" defaultValue={saved.phone ?? ""} autoComplete="tel" required />
            <Field label="CPF" name="document" defaultValue={saved.document ?? ""} />
            <Field label="CEP" name="cep" defaultValue={saved.cep ?? ""} autoComplete="postal-code" required />
            <Field label="Rua" name="street" defaultValue={saved.street ?? ""} autoComplete="address-line1" required />
            <Field label="Número" name="number" defaultValue={saved.number ?? ""} required />
            <Field label="Complemento" name="complement" defaultValue={saved.complement ?? ""} />
            <Field label="Bairro" name="district" defaultValue={saved.district ?? ""} required />
            <Field label="Cidade" name="city" defaultValue={saved.city ?? ""} required />
            <Field label="UF" name="state" defaultValue={saved.state ?? ""} maxLength={2} required className={`${inputClass} uppercase`} />
            <Field label="Referência" name="reference" defaultValue={saved.reference ?? ""} />
          </div>

          <div role="radiogroup" aria-label="Região de entrega" className="mt-5 grid gap-3 sm:grid-cols-3">
            {shippingRegions.map((entry) => {
              const selected = entry.id === regionId;
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setRegionId(entry.id)}
                  className={`rounded-2xl border p-4 text-left transition ${focusRing} ${
                    selected ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]" : "border-[color:var(--border)] hover:bg-[color:var(--accent-soft)]"
                  }`}
                >
                  <span className="block text-sm font-semibold">{entry.label}</span>
                  <span className="block text-sm text-muted tabular-nums">{formatCurrencyBRL(entry.shippingCents)}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={cardClass} aria-labelledby="cart-payment-title">
          <h2 id="cart-payment-title" className="text-lg font-semibold">Pagamento</h2>
          <div role="radiogroup" aria-label="Forma de pagamento" className="mt-4 grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((method) => {
              const selected = method.id === payment;
              return (
                <button
                  key={method.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPayment(method.id)}
                  className={`rounded-2xl border p-4 text-left text-sm font-semibold transition ${focusRing} ${
                    selected ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]" : "border-[color:var(--border)] hover:bg-[color:var(--accent-soft)]"
                  }`}
                >
                  {method.label}
                </button>
              );
            })}
          </div>
        </section>
      </fieldset>

      <aside className={`${cardClass} lg:sticky lg:top-20`}>
        <h2 className="text-lg font-semibold">Resumo</h2>
        <dl className="mt-4 space-y-3 text-sm tabular-nums">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold">{formatCurrencyBRL(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Frete</dt>
            <dd className="font-semibold">{shippingCents === null ? "—" : formatCurrencyBRL(shippingCents)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-[color:var(--border)] pt-3 text-lg">
            <dt className="font-medium">Total</dt>
            <dd className="font-semibold">{shippingCents === null ? "—" : formatCurrencyBRL(totalCents)}</dd>
          </div>
        </dl>
        {!region ? <p className="mt-4 text-xs text-muted">Escolha a região de entrega.</p> : null}
        <button type="submit" disabled={isSubmitting || !region} className={`${primaryButton} mt-5`}>
          {isSubmitting ? "Finalizando..." : "Finalizar pedido"}
        </button>
      </aside>
    </form>
  );
}
