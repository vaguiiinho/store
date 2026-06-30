import Link from "next/link";
import { getAdminOrders } from "../../../lib/storefront-api";
import { formatCurrencyBRL } from "../../../lib/format";

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
  const orders = await getAdminOrders();

  return (
    <main className="page-shell min-h-screen px-6 py-8 sm:py-12">
      <section className="surface overflow-hidden rounded-[36px]">
        <div className="grid-dots border-b border-[color:var(--border)] px-6 py-10 sm:px-10 sm:py-14">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Admin / Pedidos</p>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#191310] sm:text-5xl">
              Acompanhamento de pedidos
            </h1>
            <p className="max-w-2xl text-base text-muted sm:text-lg">
              Lista inicial para consulta operacional. O próximo passo é restringir acesso por autenticação de admin.
            </p>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
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
                    <tr key={order.id} className="bg-white/70">
                      <td className="px-4 py-4 font-semibold text-[#1d1712]">{order.number}</td>
                      <td className="px-4 py-4 text-muted">
                        {order.customer?.name ?? "Cliente visitante"}
                      </td>
                      <td className="px-4 py-4 text-muted">{order.status}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-[28px] border border-[color:var(--border)] bg-white/70 p-6 text-sm text-muted">
              Nenhum pedido encontrado.
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/admin"
              className="inline-flex rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/75 px-5 py-3 text-sm font-semibold text-[#3a281c] transition hover:bg-white"
            >
              Voltar ao admin
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
