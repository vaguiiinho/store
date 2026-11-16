"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { adjustAdminProductStockAction } from "../app/actions/storefront-actions";

const MAX_ADJUST = 10000;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";

type Props = { productId: string; productName: string; available: number };

/** Entrada/saida de estoque com quantidade livre. A API (AdminOnly) valida o ajuste e o dominio impede estoque negativo. */
export function AdminStockAdjustForm({ productId, productName, available }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const inputId = `stock-qty-${productId}`;

  function submit(direction: 1 | -1) {
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount <= 0 || amount > MAX_ADJUST) {
      setMessage({ text: `Informe um número inteiro entre 1 e ${MAX_ADJUST}.`, error: true });
      return;
    }
    if (direction === -1 && amount > available) {
      setMessage({ text: `Só há ${available} disponível(is) para saída.`, error: true });
      return;
    }
    startTransition(async () => {
      const result = await adjustAdminProductStockAction(productId, direction * amount);
      if (result.ok) {
        setMessage({ text: direction === 1 ? `Entrada de ${amount} registrada.` : `Saída de ${amount} registrada.`, error: false });
        setQuantity("1");
        router.refresh();
      } else {
        setMessage({ text: result.message, error: true });
      }
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(1);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2" aria-label={`Ajustar estoque de ${productName}`}>
      <label htmlFor={inputId} className="sr-only">
        Quantidade
      </label>
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_ADJUST}
        step={1}
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        disabled={pending}
        className={`w-20 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-sm tabular-nums ${focusRing}`}
      />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-full bg-[#1d1712] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 ${focusRing}`}
      >
        Entrada
      </button>
      <button
        type="button"
        disabled={pending || available <= 0}
        onClick={() => submit(-1)}
        className={`rounded-full border border-[color:var(--border)] px-3 py-2 text-sm font-semibold disabled:opacity-60 ${focusRing}`}
      >
        Saída
      </button>
      <p aria-live="polite" className={`w-full text-xs ${message?.error ? "text-[color:var(--danger)]" : "text-muted"}`}>
        {message?.text ?? ""}
      </p>
    </form>
  );
}
