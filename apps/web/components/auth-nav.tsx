"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { logoutAdminAction } from "../app/actions/storefront-actions";

export function AuthNav({ email }: { email?: string }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [pending, startTransition] = useTransition();
  if (!email) return <Link href="/admin/login" className="rounded-full bg-[#1d1712] px-4 py-2 text-sm font-semibold text-white">Entrar</Link>;
  return <div className="relative"><button type="button" onClick={() => setOpen(!open)} className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold">{email.split("@")[0]}</button>{open ? <div className="absolute right-0 top-full z-50 mt-3 w-44 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-2 shadow-xl"><Link href="/admin" className="block rounded-xl px-3 py-2 text-sm hover:bg-white/10">⚙ Configurações</Link><button type="button" disabled={pending} onClick={() => startTransition(() => void logoutAdminAction().then(() => { router.push("/"); router.refresh(); }))} className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-500 hover:bg-white/10">↪ Sair</button></div> : null}</div>;
}
