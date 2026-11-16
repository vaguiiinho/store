"use client";

import { useRef, useState, type FormEvent } from "react";
import { changeOwnPasswordAction } from "../app/actions/storefront-actions";

const inputClass = "w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");

    if (newPassword !== String(formData.get("confirmPassword") ?? "")) {
      setFeedback({ type: "error", message: "A confirmação não confere com a nova senha." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    const response = await changeOwnPasswordAction(currentPassword, newPassword);
    setIsSubmitting(false);

    if (!response.ok) {
      setFeedback({ type: "error", message: response.message });
      return;
    }

    formRef.current?.reset();
    setFeedback({ type: "success", message: "Senha alterada. Outras sessões abertas foram encerradas." });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Senha atual</span>
        <input name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Nova senha</span>
        <input name="newPassword" type="password" required minLength={8} autoComplete="new-password" placeholder="Mínimo de 8 caracteres" className={inputClass} />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Confirmar nova senha</span>
        <input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
      </label>

      {feedback ? (
        <div role={feedback.type === "error" ? "alert" : "status"} className={feedback.type === "error" ? "rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4 text-sm text-[color:var(--danger)]" : "rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-soft)] p-4 text-sm"}>
          {feedback.message}
        </div>
      ) : null}

      <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d] disabled:cursor-not-allowed disabled:opacity-70">
        {isSubmitting ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
