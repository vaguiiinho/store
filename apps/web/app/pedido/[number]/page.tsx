import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPage } from "../../../components/public-page";
import { formatCurrencyBRL } from "../../../lib/format";
import { getOrderByNumber } from "../../../lib/storefront-api";

export const dynamic = "force-dynamic";

type PedidoPageProps = {
  params: Promise<{
    number: string;
  }>;
};

export default async function PedidoPage({ params }: PedidoPageProps) {
  const { number } = await params;
  const order = await getOrderByNumber(number);

  if (!order) {
    notFound();
  }

  return (
    <PublicPage
      eyebrow="Pedido confirmado"
      title={`Pedido ${order.number} confirmado.`}
      description="A confirmação apresenta o estado do pedido com mais presença visual, como uma tela final de e-commerce."
      primaryAction={{ href: "/catalogo", label: "Continuar comprando" }}
      secondaryAction={{ href: "/checkout", label: "Novo checkout" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <section className="space-y-4">
          <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Resumo</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Pedido registrado e pronto para acompanhar a próxima atualização de pagamento.
                </p>
              </div>
              <span className="rounded-full border border-[color:rgba(124,79,36,0.18)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#6e4a29]">
                {order.status}
              </span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Subtotal</div>
                <div className="mt-2 text-sm font-semibold text-[#1d1712]">{formatCurrencyBRL(order.subtotalCents)}</div>
              </div>
              <div className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Frete</div>
                <div className="mt-2 text-sm font-semibold text-[#1d1712]">{formatCurrencyBRL(order.shippingCents)}</div>
              </div>
              <div className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Total</div>
                <div className="mt-2 text-sm font-semibold text-[#1d1712]">{formatCurrencyBRL(order.totalCents)}</div>
              </div>
            </div>
          </div>

          <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[#1d1712]">Linha do pedido</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Pedido criado", description: "Carrinho convertido em compra." },
                { label: "Pagamento pendente", description: "Aguardando confirmação do gateway." },
                { label: "Próximo passo", description: "Atualização automática via webhook." }
              ].map((step, index) => (
                <div key={step.label} className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-xs font-semibold accent-text">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-[#1d1712]">{step.label}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[#1d1712]">Itens</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <article key={item.id} className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1d1712]">{item.productName}</h3>
                      <p className="mt-1 text-sm text-muted">{item.quantity} unidade(s)</p>
                    </div>
                    <span className="text-sm font-semibold text-[#1d1712]">{formatCurrencyBRL(item.totalCents)}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[#1d1712]">Pagamento</h2>
            <div className="mt-4 rounded-3xl border border-[color:var(--border)] bg-white/80 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[#1d1712]">{order.payment?.method === "PIX" ? "Pix" : "Cartão"}</p>
                <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] accent-text">
                  {order.payment?.status ?? "PENDING"}
                </span>
              </div>
              <p className="mt-2 text-muted">Provedor: {order.payment?.provider ?? "mock"}</p>
              {order.payment?.instructions?.length ? (
                <ul className="mt-4 space-y-2 text-[#33251b]">
                  {order.payment.instructions.map((instruction) => (
                    <li key={instruction} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#8b5a2b]" />
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {order.payment?.qrCodeText ? (
                <div className="mt-4 rounded-2xl border border-dashed border-[color:rgba(124,79,36,0.24)] bg-[color:rgba(255,250,242,0.8)] p-4 font-mono text-xs break-all text-[#33251b]">
                  {order.payment.qrCodeText}
                </div>
              ) : null}
              {order.payment?.checkoutUrl ? (
                <a
                  href={order.payment.checkoutUrl}
                  className="mt-4 inline-flex rounded-full bg-[#1d1712] px-4 py-2 text-sm font-semibold text-[#fffaf2]"
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir checkout do cartão
                </a>
              ) : null}
            </div>
          </div>

          <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[#1d1712]">Entrega</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {order.shippingAddress.street}, {order.shippingAddress.number}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {order.shippingAddress.district} - {order.shippingAddress.city}/{order.shippingAddress.state}
            </p>
            <p className="mt-2 text-sm text-muted">CEP {order.shippingAddress.cep}</p>
            <div className="mt-4 rounded-3xl border border-[color:var(--border)] bg-white/80 p-4 text-sm">
              <p className="font-semibold text-[#1d1712]">Frete</p>
              <p className="mt-2 text-muted">{formatCurrencyBRL(order.shippingCents)}</p>
            </div>
          </div>

          <Link
            href="/catalogo"
            className="surface-strong inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-white/75 px-5 py-3 text-sm font-semibold text-[#3a281c] transition hover:bg-white"
          >
            Voltar ao catálogo
          </Link>
        </aside>
      </div>
    </PublicPage>
  );
}
