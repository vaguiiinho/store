"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { adminSetUserPasswordAction, setUserActiveAction } from "../app/actions/storefront-actions";
import type { ApiUser } from "../src/services/storefront-api";

const buttonClass = "rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold transition hover:bg-white/10 disabled:opacity-60";

export function AdminUserActions({ user, isSelf }: { user: ApiUser; isSelf: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  if (isSelf || user.primaryAdmin) {
    return <span className="text-xs text-muted">{isSelf ? "Sua conta (use Minha conta)" : "Gerido pelo ambiente"}</span>;
  }

  function toggleActive() {
    const next = !user.active;
    if (!next && !window.confirm(`Desativar ${user.email}? A pessoa perde o acesso imediatamente.`)) return;
    startTransition(async () => {
      const response = await setUserActiveAction(user.id, next);
      setFeedback(response.ok ? null : { type: "error", message: response.message });
      if (response.ok) router.refresh();
    });
  }

  function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const newPassword = String(new FormData(form).get("newPassword") ?? "");
    startTransition(async () => {
      const response = await adminSetUserPasswordAction(user.id, newPassword);
      if (response.ok) {
        form.reset();
        setShowPassword(false);
        setFeedback({ type: "success", message: "Senha redefinida. Sessões antigas foram encerradas." });
      } else {
        setFeedback({ type: "error", message: response.message });
      }
    });
  }

  return (
    <div className="flex w-full flex-col items-end gap-2 sm:w-auto">
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" disabled={pending} onClick={() => setShowPassword(!showPassword)} className={buttonClass}>Redefinir senha</button>
        <button type="button" disabled={pending} onClick={toggleActive} className={`${buttonClass} ${user.active ? "text-red-500" : ""}`}>{user.active ? "Desativar" : "Ativar"}</button>
      </div>
      {showPassword ? (
        <form onSubmit={resetPassword} className="flex w-full gap-2 sm:w-72">
          <input name="newPassword" type="password" required minLength={8} autoComplete="new-password" aria-label={`Nova senha para ${user.email}`} placeholder="Nova senha (mín. 8)" className="min-w-0 flex-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs" />
          <button type="submit" disabled={pending} className={buttonClass}>Salvar</button>
        </form>
      ) : null}
      {feedback ? <p role={feedback.type === "error" ? "alert" : "status"} className={`text-xs ${feedback.type === "error" ? "text-[color:var(--danger)]" : "text-muted"}`}>{feedback.message}</p> : null}
    </div>
  );
}
