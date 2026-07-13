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
        <span className="text-sm font-semibold text-[#1d1712]">E-mail</span>
        <input
          type="email"
          name="email"
          required
          placeholder="admin@store.local"
          className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[#1d1712]">Senha</span>
        <input
          type="password"
          name="password"
          required
          placeholder="••••••••"
          className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-[color:rgba(153,27,27,0.24)] bg-[color:rgba(254,242,242,0.8)] p-4 text-sm text-[#7f1d1d]">
          {error}
        </div>
      ) : null}

      <div className="rounded-[24px] border border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,239,228,0.9))] p-4 text-sm leading-6 text-muted">
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
