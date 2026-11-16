import Link from "next/link";
import { PublicPage } from "../../components/public-page";
import { getMyOrders } from "../../lib/storefront-api";
import { getCookieHeader } from "../../lib/session";
import { formatCurrencyBRL } from "../../lib/format";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const orders = await getMyOrders(await getCookieHeader());
  return <PublicPage eyebrow="Pedidos" title="Acompanhe suas compras" description="Todos os pedidos feitos com a sua conta.">
    {orders === null ? <p role="alert" className="text-sm text-muted">Não foi possível carregar seus pedidos. Tente novamente.</p> : orders.length ? <div className="space-y-3">{orders.map((order) => <Link key={order.id} href={`/pedido/${order.number}`} className="surface-strong flex items-center justify-between rounded-2xl border border-[color:var(--border)] p-5"><span><strong>{order.number}</strong><span className="ml-3 text-sm text-muted">{order.status}</span></span><strong>{formatCurrencyBRL(order.totalCents)}</strong></Link>)}</div> : <p className="text-sm text-muted">Você ainda não fez pedidos. <Link href="/catalogo" className="font-semibold underline">Ver catálogo</Link></p>}
  </PublicPage>;
}
