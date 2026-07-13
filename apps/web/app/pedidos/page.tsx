import Link from "next/link";
import { PublicPage } from "../../components/public-page";
import { getVisitorOrders } from "../../lib/storefront-api";
import { formatCurrencyBRL } from "../../lib/format";

type Props = { searchParams: Promise<{ email?: string; phone?: string }> };

export default async function PedidosPage({ searchParams }: Props) {
  const params = await searchParams;
  const email = params.email?.trim() ?? ""; const phone = params.phone?.trim() ?? "";
  const orders = email && phone ? await getVisitorOrders(email, phone) : null;
  return <PublicPage eyebrow="Pedidos" title="Acompanhe suas compras" description="Informe o mesmo e-mail e telefone usados no checkout.">
    <form method="get" className="surface-strong grid gap-3 rounded-[28px] border border-[color:var(--border)] p-5 sm:grid-cols-[1fr_1fr_auto]">
      <input required type="email" name="email" defaultValue={email} placeholder="E-mail do checkout" className="rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 py-3 text-sm" />
      <input required type="tel" name="phone" defaultValue={phone} placeholder="Telefone do checkout" className="rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 py-3 text-sm" />
      <button className="rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-white">Consultar</button>
    </form>
    {orders ? <div className="mt-5 space-y-3">{orders.length ? orders.map((order) => <Link key={order.id} href={`/pedido/${order.number}`} className="surface-strong flex items-center justify-between rounded-2xl border border-[color:var(--border)] p-5"><span><strong>{order.number}</strong><span className="ml-3 text-sm text-muted">{order.status}</span></span><strong>{formatCurrencyBRL(order.totalCents)}</strong></Link>) : <p className="mt-5 text-sm text-muted">Nenhum pedido encontrado.</p>}</div> : null}
  </PublicPage>;
}
