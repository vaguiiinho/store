import Link from "next/link";
import { Fragment } from "react";
import { cookies } from "next/headers";
import { PageHeader } from "../../../../components/page-header";
import { requireAdmin } from "../../../../lib/session";
import { getAdminOrders } from "../../../../lib/storefront-api";
import { formatCurrencyBRL } from "../../../../lib/format";
import { AdminOrderStatusControl } from "../../../../components/admin-order-status-control";
import { AdminOrderDeleteControl } from "../../../../components/admin-order-delete-control";

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function AdminPedidosPage() {
  const cookieHeader = (await cookies()).toString();
  await requireAdmin();

  const orders = await getAdminOrders(cookieHeader);

  return (
    <>
      <PageHeader title="Pedidos" />
      <div>
          {orders && orders.length > 0 ? (
            <div className="overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-white/80">
              <table className="min-w-full divide-y divide-[color:var(--border)] text-left text-sm">
                <thead className="bg-white/70 text-xs uppercase tracking-[0.25em] text-[#7d624d]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Pedido</th>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Criado em</th>
                    <th className="px-4 py-3 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--border)]">
                  {orders.map((order) => (
                    <Fragment key={order.id}>
                      <tr key={order.id} className="bg-white/70">
                        <td className="px-4 py-4 font-semibold text-[#1d1712]">{order.number}</td>
                        <td className="px-4 py-4 text-muted">
                          {order.customer?.name ?? "Cliente visitante"}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] accent-text">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-[#1d1712]">
                          {formatCurrencyBRL(order.totalCents)}
                        </td>
                        <td className="px-4 py-4 text-muted">{formatDateTime(order.createdAt)}</td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/pedido/${order.number}`}
                            className="font-semibold accent-text transition hover:text-[#5f3719]"
                          >
                            Abrir
                          </Link>
                        </td>
                      </tr>
                      <tr className="border-b border-[color:var(--border)] bg-white/40">
                        <td className="px-4 pb-4 pt-0" colSpan={6}>
                          <AdminOrderStatusControl orderId={order.id} currentStatus={order.status} />
                          <AdminOrderDeleteControl orderId={order.id} />
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-[28px] border border-[color:var(--border)] bg-white/70 p-6 text-sm text-muted">
              Nenhum pedido encontrado.
            </div>
          )}
      </div>
    </>
  );
}
