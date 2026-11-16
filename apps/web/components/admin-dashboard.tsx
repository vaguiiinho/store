import Link from "next/link";
import { StatCard, StatError } from "./stat-card";
import { formatCurrencyBRL } from "../lib/format";
import type { AdminOrderSummary, ApiOrder, ApiProduct, ApiUser } from "../src/services/storefront-api";

const LOW_STOCK_THRESHOLD = 5;
const USERS_API_LIMIT = 100;

const buttonClass =
  "inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-semibold transition hover:bg-[color:var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";

type AdminDashboardProps = {
  summary: AdminOrderSummary | null;
  products: ApiProduct[] | null;
  users: ApiUser[] | null;
  recentOrders: ApiOrder[] | null;
};

export function AdminDashboard({ summary, products, users, recentOrders }: AdminDashboardProps) {
  const lowStock = products?.filter((product) => product.active && product.stock && product.stock.availableQuantity <= LOW_STOCK_THRESHOLD) ?? [];
  const activeUsers = users?.filter((user) => user.active).length ?? 0;
  const activeProducts = products?.filter((product) => product.active).length ?? 0;
  const inactiveProducts = (products?.length ?? 0) - activeProducts;

  return (
    <div className="space-y-6">
      {summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Pedidos totais" value={summary.totalOrders} href="/admin/pedidos" />
          <StatCard label="Aguardando pagamento" value={summary.awaitingPayment} href="/admin/pedidos" />
          <StatCard label="Em andamento" value={summary.inProgress} href="/admin/pedidos" />
          <StatCard label="Entregues" value={summary.delivered} href="/admin/pedidos" />
          <StatCard label="Cancelados" value={summary.cancelled} href="/admin/pedidos" />
          <StatCard label="Receita" value={formatCurrencyBRL(summary.revenueCents)} />
          <StatCard label={`Pedidos em ${summary.periodDays} dias`} value={summary.ordersInPeriod} />
          <StatCard
            label="Usuários ativos"
            value={users ? (users.length >= USERS_API_LIMIT ? `${USERS_API_LIMIT}+` : activeUsers) : "—"}
            href="/admin/usuarios"
          />
        </div>
      ) : (
        <StatError label="os indicadores de pedidos" />
      )}

      {products ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Produtos ativos" value={activeProducts} href="/admin/produtos" />
          <StatCard label="Produtos inativos" value={inactiveProducts} href="/admin/produtos" />
        </div>
      ) : (
        <StatError label="os produtos" />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface rounded-[24px] p-5" aria-labelledby="recent-orders-title">
          <h2 id="recent-orders-title" className="text-lg font-semibold">Pedidos recentes</h2>
          {recentOrders === null ? (
            <div className="mt-3"><StatError label="os pedidos recentes" /></div>
          ) : recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nenhum pedido recente</p>
          ) : (
            <ul className="mt-3 divide-y divide-[color:var(--border)]">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link href={`/pedido/${order.number}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:opacity-80">
                    <span>
                      <strong>{order.number}</strong>
                      <span className="ml-3 text-muted">{order.status}</span>
                    </span>
                    <strong className="tabular-nums">{formatCurrencyBRL(order.totalCents)}</strong>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface rounded-[24px] p-5" aria-labelledby="low-stock-title">
          <h2 id="low-stock-title" className="text-lg font-semibold">Estoque baixo</h2>
          {products === null ? (
            <div className="mt-3"><StatError label="o estoque" /></div>
          ) : lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Estoque em dia</p>
          ) : (
            <ul className="mt-3 divide-y divide-[color:var(--border)]">
              {lowStock.map((product) => (
                <li key={product.id}>
                  <Link href={`/admin/produtos/${product.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:opacity-80">
                    <span className="truncate font-semibold">{product.name}</span>
                    <span className="tabular-nums text-[color:var(--danger)]">{product.stock?.availableQuantity} {product.stock?.unit.abbreviation}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/produtos" className={buttonClass}>Produtos</Link>
        <Link href="/admin/pedidos" className={buttonClass}>Pedidos</Link>
        <Link href="/admin/usuarios" className={buttonClass}>Usuários</Link>
      </div>
    </div>
  );
}
