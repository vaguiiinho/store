"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveAdminCategoryAction } from "../app/actions/storefront-actions";
import { PlusIcon } from "./icons";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";
const inputClass = `w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm aria-[invalid=true]:border-[color:var(--danger-border)] ${focusRing}`;

/** Cartao de criacao inline. A API valida unicidade e formato; aqui so evitamos envios vazios. */
export function AdminCategoryForm() {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await saveAdminCategoryAction(null, { name, slug });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setName("");
      setSlug("");
      setSlugTouched(false);
      setSuccess("Categoria criada.");
      router.refresh();
      nameRef.current?.focus();
      window.setTimeout(() => setSuccess(null), 4000);
    });
  }

  return (
    <section className="surface rounded-[24px] p-5" aria-labelledby="new-category-title">
      <h2 id="new-category-title" className="text-lg font-semibold">Nova categoria</h2>
      <form onSubmit={onSubmit} aria-busy={pending} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block space-y-1">
          <span className="text-sm font-semibold">Nome</span>
          <input ref={nameRef} type="text" name="name" required maxLength={60} value={name} aria-invalid={error ? true : undefined} onChange={(event) => { setName(event.target.value); if (!slugTouched) setSlug(slugify(event.target.value)); }} className={inputClass} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-semibold">Slug</span>
          <input type="text" name="slug" required maxLength={80} value={slug} aria-invalid={error ? true : undefined} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value); }} aria-describedby="new-category-slug-help" className={`${inputClass} font-mono`} />
          <span id="new-category-slug-help" className="block text-xs text-muted">Sugerido a partir do nome; você pode editar.</span>
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
