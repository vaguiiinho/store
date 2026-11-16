"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteUserAction } from "../app/actions/storefront-actions";
import type { ApiUser } from "../src/services/storefront-api";

export function AdminUserDelete({ user }: { user: ApiUser }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (!window.confirm(`Excluir ${user.email} permanentemente? Os pedidos dessa conta são mantidos, mas ficam sem dono.`)) return;
    startTransition(async () => {
      const response = await deleteUserAction(user.id);
      if (!response.ok) {
        setError(response.message);
        return;
      }
      router.replace("/admin/usuarios");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm leading-6 text-muted">Prefira <strong>desativar</strong> se a pessoa puder voltar. A exclusão remove a conta e não pode ser desfeita.</p>
      <button type="button" disabled={pending} onClick={remove} className="rounded-full border border-[color:var(--danger-border)] px-4 py-2 text-sm font-semibold text-[color:var(--danger)] transition hover:bg-[color:var(--danger-soft)] disabled:opacity-60">
        {pending ? "Excluindo..." : "Excluir usuário"}
      </button>
      {error ? <p role="alert" className="text-sm text-[color:var(--danger)]">{error}</p> : null}
    </div>
  );
}
