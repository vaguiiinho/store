"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeAdminStockUnitAction } from "../app/actions/storefront-actions";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";

type UnitOption = { id: string; name: string; abbreviation: string; active: boolean };
type Props = { productId: string; productName: string; currentUnitId: string; units: UnitOption[]; hasBalance: boolean };

/** Troca a unidade do estoque. Nao converte quantidades; pede confirmacao quando ha saldo. */
export function AdminStockUnitSelect({ productId, productName, currentUnitId, units, hasBalance }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(currentUnitId);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const selectId = `stock-unit-${productId}`;
  const options = units.filter((unit) => unit.active || unit.id === currentUnitId);

  function onChange(nextId: string) {
    const next = units.find((unit) => unit.id === nextId);
    if (!next || nextId === value) return;
    if (hasBalance && !window.confirm(`Trocar a unidade de ${productName} para ${next.name}? As quantidades não são convertidas.`)) return;
    const previous = value;
    setValue(nextId);
    setError(null);
    setMessage("");
    startTransition(async () => {
      const result = await changeAdminStockUnitAction(productId, nextId);
      if (!result.ok) {
        setValue(previous);
        setError(result.message);
        return;
      }
      setMessage(`Unidade alterada para ${next.abbreviation}.`);
      router.refresh();
    });
  }

  return (
    <div className="text-xs">
      <label htmlFor={selectId} className="sr-only">
        Unidade de {productName}
      </label>
      <select
        id={selectId}
        value={value}
        disabled={pending}
        aria-busy={pending}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-sm ${focusRing}`}
      >
        {options.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.name} ({unit.abbreviation})
          </option>
        ))}
      </select>
      {error ? (
        <p role="alert" className="mt-1 text-[color:var(--danger)]">{error}</p>
      ) : null}
      <p aria-live="polite" className={message ? "mt-1 text-muted" : "sr-only"}>{message}</p>
    </div>
  );
}
