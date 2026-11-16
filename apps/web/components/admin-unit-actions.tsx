"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAdminUnitAction, saveAdminUnitAction } from "../app/actions/storefront-actions";
import { PencilIcon, TrashIcon } from "./icons";
import type { AdminUnit } from "../src/services/storefront-api";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";
const inputClass = `w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2.5 text-sm aria-[invalid=true]:border-[color:var(--danger-border)] ${focusRing}`;
const buttonClass = `inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[color:var(--border)] px-4 text-sm font-semibold disabled:opacity-60 sm:h-10 ${focusRing}`;

type Mode = "view" | "edit" | "confirm-delete";

function countLabel(count: number) {
  return count === 1 ? "1 estoque" : `${count} estoques`;
}

/** Linha da lista com edicao inline, ativar/desativar e exclusao com confirmacao inline. */
export function AdminUnitActions({ item }: { item: AdminUnit }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("view");
  const [name, setName] = useState(item.name);
  const [abbreviation, setAbbreviation] = useState(item.abbreviation);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [pending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const count = item.stockCount;
  const subject = "unidade " + item.name;

  useEffect(() => {
    if (mode === "edit") nameRef.current?.focus();
    if (mode === "confirm-delete") cancelDeleteRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(""), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  function backToView(focusEdit: boolean) {
    setMode("view");
    setError(null);
    if (focusEdit) window.setTimeout(() => editRef.current?.focus(), 0);
  }

  function run(task: () => Promise<{ ok: true } | { ok: false; message: string }>, success: string, after?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await task();
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setStatus(success);
      after?.();
      router.refresh();
    });
  }

  function saveEdit() {
    run(() => saveAdminUnitAction(item.id, { name, abbreviation, active: item.active }), "Unidade atualizada.", () => backToView(true));
  }

  function toggleActive() {
    run(() => saveAdminUnitAction(item.id, { name: item.name, abbreviation: item.abbreviation, active: !item.active }), item.active ? "Unidade desativada." : "Unidade ativada.");
  }

  function remove() {
    run(() => deleteAdminUnitAction(item.id), "Unidade excluída.", () => setMode("view"));
  }

  const badge = item.active
    ? "border-[color:var(--success-border)] bg-[color:var(--success-soft)] text-[color:var(--success)]"
    : "border-[color:var(--border)] text-muted";

  return (
    <li className="surface rounded-[24px] p-4" aria-busy={pending}>
      {mode === "edit" ? (
        <form
          onSubmit={(event) => { event.preventDefault(); saveEdit(); }}
          onKeyDown={(event) => { if (event.key === "Escape") backToView(true); }}
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Nome</span>
            <input ref={nameRef} type="text" required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} aria-invalid={error ? true : undefined} className={inputClass} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Sigla</span>
            <input type="text" required maxLength={8} value={abbreviation} onChange={(event) => setAbbreviation(event.target.value)} aria-invalid={error ? true : undefined} className={`${inputClass} sm:w-28`} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={pending} className={`${buttonClass} bg-[#1d1712] text-white`}>{pending ? "Salvando..." : "Salvar"}</button>
            <button type="button" disabled={pending} onClick={() => { setName(item.name); setAbbreviation(item.abbreviation); backToView(true); }} className={buttonClass}>Cancelar</button>
          </div>
        </form>
      ) : (
        <div className="space-y-3 md:grid md:grid-cols-[1fr_auto_auto] md:items-center md:gap-4 md:space-y-0">
          <div className="min-w-0">
            <p className="font-semibold">{item.name}</p>
            <p className="text-xs text-muted ">{item.abbreviation}</p>
          </div>
          <p className="flex items-center gap-3 text-sm text-muted">
            <span className="tabular-nums">{countLabel(count)}</span>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${badge}`}>{item.active ? "Ativa" : "Inativa"}</span>
          </p>
          {mode === "confirm-delete" ? (
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Confirmar exclusão de ${subject}`}>
              <span className="text-sm font-semibold">Confirmar exclusão?</span>
              <button ref={cancelDeleteRef} type="button" disabled={pending} onClick={() => setMode("view")} className={buttonClass}>Cancelar</button>
              <button type="button" disabled={pending} onClick={remove} className={`${buttonClass} border-[color:var(--danger-border)] text-[color:var(--danger)]`}>{pending ? "Excluindo..." : "Excluir"}</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button ref={editRef} type="button" disabled={pending} onClick={() => setMode("edit")} aria-label={`Editar ${subject}`} className={buttonClass}>
                <PencilIcon className="h-4 w-4" />
                Editar
              </button>
              <button type="button" disabled={pending} onClick={toggleActive} aria-label={`${item.active ? "Desativar" : "Ativar"} ${subject}`} className={buttonClass}>
                {item.active ? "Desativar" : "Ativar"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setMode("confirm-delete")}
                aria-label={`Excluir ${subject}`}
                title={count > 0 ? "Em uso: desative em vez de excluir" : undefined}
                className={`${buttonClass} ${count > 0 ? "text-muted" : "border-[color:var(--danger-border)] text-[color:var(--danger)]"}`}
              >
                <TrashIcon className="h-4 w-4" />
                Excluir
              </button>
            </div>
          )}
        </div>
      )}
      {error ? (
        <p role="alert" className="mt-3 rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-3 text-sm text-[color:var(--danger)]">{error}</p>
      ) : null}
      <p role="status" className={status ? "mt-3 text-xs text-[color:var(--success)]" : "sr-only"}>{status}</p>
    </li>
  );
}
