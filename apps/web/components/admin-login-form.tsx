"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { loginAdminAction } from "../app/actions/storefront-actions";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await loginAdminAction(String(formData.get("email") ?? "").trim(), String(formData.get("password") ?? ""));
      if (!response.ok) throw new Error(response.message);

      router.push("/");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Falha ao autenticar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[color:var(--foreground)]">E-mail</span>
        <input
          type="email"
          name="email"
          required
          placeholder="admin@store.com"
          className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[color:var(--foreground)]">Senha</span>
        <input
          type="password"
          name="password"
          required
          placeholder="••••••••"
          className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
        />
      </label>

      {error ? (
        <div role="alert" className="rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4 text-sm text-[color:var(--danger)]">
          {error}
        </div>
      ) : null}

      <div className="rounded-[24px] border border-[color:var(--accent)] bg-[color:var(--accent-soft)] p-4 text-sm leading-6 text-[color:var(--foreground)]">
        Acesse produtos, estoque e pedidos com sessão protegida.
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] shadow-[0_10px_24px_rgba(29,23,18,0.16)] transition hover:bg-[#34261d] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
