"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveAdminUnitAction } from "../app/actions/storefront-actions";
import { PlusIcon } from "./icons";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";
const inputClass = `w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm aria-[invalid=true]:border-[color:var(--danger-border)] ${focusRing}`;

/** Cartao de criacao inline. A API valida unicidade e formato; aqui so evitamos envios vazios. */
export function AdminUnitForm() {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await saveAdminUnitAction(null, { name, abbreviation });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setName("");
      setAbbreviation("");
      setSuccess("Unidade criada.");
      router.refresh();
      nameRef.current?.focus();
      window.setTimeout(() => setSuccess(null), 4000);
    });
  }

  return (
    <section className="surface rounded-[24px] p-5" aria-labelledby="new-unit-title">
      <h2 id="new-unit-title" className="text-lg font-semibold">Nova unidade</h2>
      <form onSubmit={onSubmit} aria-busy={pending} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block space-y-1">
          <span className="text-sm font-semibold">Nome</span>
          <input ref={nameRef} type="text" name="name" required maxLength={60} value={name} aria-invalid={error ? true : undefined} onChange={(event) => setName(event.target.value)} className={inputClass} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-semibold">Sigla</span>
          <input type="text" name="abbreviation" required maxLength={8} value={abbreviation} aria-invalid={error ? true : undefined} onChange={(event) => { setAbbreviation(event.target.value); }} aria-describedby="new-unit-abbreviation-help" className={`${inputClass} sm:w-28`} />
          <span id="new-unit-abbreviation-help" className="block text-xs text-muted">Ex.: kg, L, m²</span>
        </label>
        <button type="submit" disabled={pending} className={`inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1d1712] px-5 text-sm font-semibold text-white disabled:opacity-60 sm:h-10 ${focusRing}`}>
          <PlusIcon className="h-4 w-4" />
          {pending ? "Criando..." : "Criar"}
        </button>
      </form>
      {error ? (
        <p role="alert" className="mt-3 rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-3 text-sm text-[color:var(--danger)]">{error}</p>
      ) : null}
      <p role="status" className={success ? "mt-3 rounded-2xl border border-[color:var(--success-border)] bg-[color:var(--success-soft)] p-3 text-sm text-[color:var(--success)]" : "sr-only"}>{success ?? ""}</p>
    </section>
  );
}
