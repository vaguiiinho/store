"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { createUserAction } from "../app/actions/storefront-actions";
import type { UserRole } from "../src/services/storefront-api";

const inputClass = "w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]";

export function AdminUserForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setFeedback(null);

    const response = await createUserAction({
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      role: (String(formData.get("role") ?? "USER") as UserRole)
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setFeedback({ type: "error", message: response.message });
      return;
    }

    formRef.current?.reset();
    setFeedback({ type: "success", message: `Usuário ${response.data?.email ?? ""} criado.` });
    router.refresh();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Nome</span>
        <input name="name" required maxLength={120} className={inputClass} placeholder="Nome completo" />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">E-mail</span>
        <input name="email" type="email" required autoComplete="off" className={inputClass} placeholder="pessoa@email.com" />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Senha inicial</span>
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} placeholder="Mínimo de 8 caracteres" />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Papel</span>
        <select name="role" defaultValue="USER" className={inputClass}>
          <option value="USER">Usuário: carrinho, checkout e próprios pedidos</option>
          <option value="ADMIN">Admin: acesso total</option>
        </select>
      </label>

      {feedback ? (
        <div role={feedback.type === "error" ? "alert" : "status"} className={feedback.type === "error" ? "rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4 text-sm text-[color:var(--danger)]" : "rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-soft)] p-4 text-sm"}>
          {feedback.message}
        </div>
      ) : null}

      <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d] disabled:cursor-not-allowed disabled:opacity-70">
        {isSubmitting ? "Criando..." : "Criar usuário"}
      </button>
    </form>
  );
}
