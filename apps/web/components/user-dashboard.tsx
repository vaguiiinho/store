import Link from "next/link";
import { StatCard, StatError } from "./stat-card";
import { CartLinkWithCount } from "./cart-link-with-count";
import { formatCurrencyBRL } from "../lib/format";
import type { ApiOrder } from "../src/services/storefront-api";

const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";

export function UserDashboard({ orders }: { orders: ApiOrder[] | null }) {
  const list = orders ?? [];
  const awaiting = list.filter((order) => order.status === "AWAITING_PAYMENT").length;
  const inProgress = list.filter((order) => ["PAID", "PREPARING", "SHIPPED"].includes(order.status)).length;
  const last = list[0] ?? null;

  return (
    <div className="space-y-6">
      {orders === null ? <StatError label="seus pedidos" /> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de pedidos" value={list.length} href="/pedidos" />
        <StatCard label="Aguardando pagamento" value={awaiting} href="/pedidos" />
        <StatCard label="Em andamento" value={inProgress} href="/pedidos" />
        {last ? (
          <StatCard
            label="Último pedido"
            value={last.number}
            href={`/pedido/${last.number}`}
            hint={`${last.status} · ${formatCurrencyBRL(last.totalCents)}`}
          />
        ) : (
          <div className="surface rounded-[24px] p-5">
            <p className="text-xs uppercase tracking-wide text-muted">Último pedido</p>
            <p className="mt-2 text-sm font-semibold">Você ainda não fez pedidos</p>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className={primaryButton}>
          Ir para a loja
        </Link>
        <CartLinkWithCount />
      </div>
    </div>
  );
}
