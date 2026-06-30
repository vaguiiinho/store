"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminProductStatusControlProps = {
  productId: string;
  currentActive: boolean;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export function AdminProductStatusControl({ productId, currentActive }: AdminProductStatusControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function updateStatus() {
    setMessage(null);
    const nextActive = !currentActive;

    const response = await fetch(`${apiBaseUrl}/admin/products/${productId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ active: nextActive })
    });

    const body = (await response.json()) as { message?: string | string[] } | null;

    if (!response.ok) {
      const fallback = "Nao foi possivel atualizar o produto.";
      const nextMessage = body?.message
        ? Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message
        : fallback;

      throw new Error(nextMessage);
    }

    router.refresh();
    setMessage(nextActive ? "Produto ativado." : "Produto desativado.");
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => {
          startTransition(() => {
            updateStatus().catch((error: unknown) => {
              setMessage(error instanceof Error ? error.message : "Falha ao atualizar produto.");
            });
          });
        }}
        disabled={isPending}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
          currentActive
            ? "bg-[#1d1712] text-[#fffaf2] hover:bg-[#34261d]"
            : "border border-[color:rgba(124,79,36,0.24)] bg-white/80 text-[#3a281c] hover:bg-white"
        }`}
      >
        {isPending ? "Salvando..." : currentActive ? "Desativar" : "Ativar"}
      </button>

      <p className="text-xs text-muted">{message ?? `Atual: ${currentActive ? "ativo" : "inativo"}`}</p>
    </div>
  );
}
