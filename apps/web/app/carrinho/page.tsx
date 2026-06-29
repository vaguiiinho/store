import Link from "next/link";
import { PublicPage } from "../../components/public-page";
import { featuredProducts } from "../../lib/storefront-content";
import { formatCurrencyBRL } from "../../lib/format";

export default function CarrinhoPage() {
  const items = featuredProducts.slice(0, 2);
  const subtotal = items.reduce((sum, item) => sum + item.priceCents, 0);

  return (
    <PublicPage
      eyebrow="Carrinho"
      title="Resumo do pedido com total previsível antes do checkout."
      description="A primeira versão já separa o que é item, subtotal e próxima ação. Depois entram persistência local e controle de quantidade."
      primaryAction={{ href: "/checkout", label: "Continuar para checkout" }}
      secondaryAction={{ href: "/catalogo", label: "Adicionar mais itens" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
        <section className="space-y-4">
          {items.map((item) => (
            <article key={item.slug} className="surface-strong flex flex-col gap-4 rounded-[28px] border border-[color:var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#1d1712]">{item.name}</h2>
                <p className="mt-1 text-sm text-muted">{item.note}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-[color:rgba(124,79,36,0.18)] bg-white/70 px-3 py-1 text-sm font-semibold text-[#36261b]">
                  1x
                </span>
                <span className="text-sm font-semibold text-[#1e1713]">{formatCurrencyBRL(item.priceCents)}</span>
              </div>
            </article>
          ))}
        </section>

        <aside className="surface-strong h-fit rounded-[28px] border border-[color:var(--border)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Totais</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-[#1e1713]">{formatCurrencyBRL(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Frete</dt>
              <dd className="font-semibold text-[#1e1713]">Calculado no checkout</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[color:var(--border)] pt-3">
              <dt className="text-base font-medium text-[#1e1713]">Total</dt>
              <dd className="text-base font-semibold text-[#1e1713]">{formatCurrencyBRL(subtotal)}</dd>
            </div>
          </dl>

          <Link
            href="/checkout"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#1d1712] px-4 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d]"
          >
            Finalizar compra
          </Link>
        </aside>
      </div>
    </PublicPage>
  );
}
