"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adjustAdminProductStockAction, deleteAdminProductAction } from "../app/actions/storefront-actions";

export function AdminProductInventoryControl({ productId }: { productId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const run = (action: () => Promise<{ ok: boolean; message?: string }>, success: string) => startTransition(() => void action().then((result) => { setMessage(result.ok ? success : result.message ?? "Não foi possível concluir."); if (result.ok) router.refresh(); }));
  return <div className="flex flex-wrap items-center gap-2"><button type="button" disabled={pending} onClick={() => run(() => adjustAdminProductStockAction(productId, -1), "1 item removido.")} className="rounded-full border border-[color:var(--border)] px-3 py-2 text-sm font-semibold">− estoque</button><button type="button" disabled={pending} onClick={() => run(() => adjustAdminProductStockAction(productId, 1), "1 item adicionado.")} className="rounded-full bg-[#1d1712] px-3 py-2 text-sm font-semibold text-white">+ estoque</button><button type="button" disabled={pending} onClick={() => { if (window.confirm("Excluir este produto?")) run(() => deleteAdminProductAction(productId), "Produto excluído."); }} className="rounded-full px-3 py-2 text-sm font-semibold text-red-700">Excluir</button>{message ? <span className="w-full text-xs text-muted">{message}</span> : null}</div>;
}
