"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAdminOrderAction } from "../app/actions/storefront-actions";

export function AdminOrderDeleteControl({ orderId }: { orderId: string }) {
  const router = useRouter(); const [message, setMessage] = useState<string | null>(null); const [pending, startTransition] = useTransition();
  return <div className="mt-2"><button type="button" disabled={pending} onClick={() => { if (!window.confirm("Excluir este pedido?")) return; startTransition(() => void deleteAdminOrderAction(orderId).then((result) => { setMessage(result.ok ? "Pedido excluído." : result.message); if (result.ok) router.refresh(); })); }} className="text-xs font-semibold text-red-700">{pending ? "Excluindo..." : "Excluir pedido"}</button>{message ? <span className="ml-3 text-xs text-muted">{message}</span> : null}</div>;
}
