"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type OrderStatus = "CREATED" | "AWAITING_PAYMENT" | "PAID" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type StatusOption = {
  value: OrderStatus;
  label: string;
};

const statusOptions: StatusOption[] = [
  { value: "CREATED", label: "Criado" },
  { value: "AWAITING_PAYMENT", label: "Aguardando pagamento" },
  { value: "PAID", label: "Pago" },
  { value: "PREPARING", label: "Em separação" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" }
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type AdminOrderStatusControlProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function AdminOrderStatusControl({ orderId, currentStatus }: AdminOrderStatusControlProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function updateStatus() {
    setMessage(null);

    const response = await fetch(`${apiBaseUrl}/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    const body = (await response.json()) as { message?: string | string[] } | null;

    if (!response.ok) {
      const fallback = "Nao foi possivel atualizar o status.";
      const nextMessage = body?.message
        ? Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message
        : fallback;

      throw new Error(nextMessage);
    }

    router.refresh();
    setMessage("Status atualizado.");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
          className="rounded-2xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[#1d1712] outline-none transition focus:border-[color:rgba(124,79,36,0.45)]"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            startTransition(() => {
              updateStatus().catch((error: unknown) => {
                setMessage(error instanceof Error ? error.message : "Falha ao atualizar status.");
              });
            });
          }}
          disabled={isPending || status === currentStatus}
          className="rounded-full bg-[#1d1712] px-4 py-2 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <p className="text-xs text-muted">{message ?? `Atual: ${currentStatus}`}</p>
    </div>
  );
}
