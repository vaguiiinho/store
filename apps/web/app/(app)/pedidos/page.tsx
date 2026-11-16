import Link from "next/link";
import { PageHeader } from "../../../components/page-header";
import { getMyOrders } from "../../../lib/storefront-api";
import { getCookieHeader } from "../../../lib/session";
import { formatCurrencyBRL } from "../../../lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meus pedidos" };

export default async function PedidosPage() {
  const orders = await getMyOrders(await getCookieHeader());
  return (
    <>
      <PageHeader title="Meus pedidos" />
      {orders === null ? (
        <p role="alert" className="text-sm text-[color:var(--danger)]">Não foi possível carregar seus pedidos. Tente novamente.</p>
      ) : orders.length ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/pedido/${order.number}`} className="surface-strong flex items-center justify-between rounded-2xl border border-[color:var(--border)] p-5">
              <span>
                <strong>{order.number}</strong>
                <span className="ml-3 text-sm text-muted">{order.status}</span>
              </span>
              <strong className="tabular-nums">{formatCurrencyBRL(order.totalCents)}</strong>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">
          Você ainda não fez pedidos. <Link href="/" className="font-semibold underline">Ir para a loja</Link>
        </p>
      )}
    </>
  );
}
