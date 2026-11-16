"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { updateUserAction } from "../app/actions/storefront-actions";
import type { ApiUser, UpdateUserInput, UserRole } from "../src/services/storefront-api";

const inputClass = "w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] disabled:opacity-60";

export function AdminUserEditForm({ user, isSelf }: { user: ApiUser; isSelf: boolean }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lockEmail = user.primaryAdmin;
  const lockRole = user.primaryAdmin || isSelf;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const input: UpdateUserInput = { name: String(formData.get("name") ?? "").trim() };
    if (!lockEmail) input.email = String(formData.get("email") ?? "").trim();
    if (!lockRole) input.role = String(formData.get("role") ?? user.role) as UserRole;

    setIsSubmitting(true);
    setFeedback(null);
    const response = await updateUserAction(user.id, input);
    setIsSubmitting(false);

    if (!response.ok) {
      setFeedback({ type: "error", message: response.message });
      return;
    }

    setFeedback({ type: "success", message: "Dados atualizados." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Nome</span>
        <input name="name" required maxLength={120} defaultValue={user.name} className={inputClass} />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">E-mail</span>
        <input name="email" type="email" required defaultValue={user.email} disabled={lockEmail} className={inputClass} />
        {lockEmail ? <span className="block text-xs text-muted">Definido por <code>ADMIN_EMAIL</code> no ambiente.</span> : null}
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Papel</span>
        <select name="role" defaultValue={user.role} disabled={lockRole} className={inputClass}>
          <option value="USER">Usuário: carrinho, checkout e próprios pedidos</option>
          <option value="ADMIN">Admin: acesso total</option>
        </select>
        {lockRole ? <span className="block text-xs text-muted">{user.primaryAdmin ? "O admin principal é sempre ADMIN." : "Você não pode alterar o seu próprio papel."}</span> : null}
      </label>

      {feedback ? (
        <div role={feedback.type === "error" ? "alert" : "status"} className={feedback.type === "error" ? "rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4 text-sm text-[color:var(--danger)]" : "rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-soft)] p-4 text-sm"}>
          {feedback.message}
        </div>
      ) : null}

      <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d] disabled:cursor-not-allowed disabled:opacity-70">
        {isSubmitting ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
