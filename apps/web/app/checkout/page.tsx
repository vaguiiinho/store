import Link from "next/link";
import { PublicPage } from "../../components/public-page";
import { featuredProducts } from "../../lib/storefront-content";
import { formatCurrencyBRL } from "../../lib/format";

export default function CheckoutPage() {
  const shippingOptions = [
    { region: "Capital", value: 1500 },
    { region: "Interior", value: 2300 }
  ];

  return (
    <PublicPage
      eyebrow="Checkout"
      title="Fluxo de compra como visitante, sem fricção desnecessária."
      description="O checkout já deixa preparados os blocos de contato, endereço, frete por região e escolha entre Pix e cartão via Mercado Pago."
      primaryAction={{ href: "#pagamento", label: "Ver opções de pagamento" }}
      secondaryAction={{ href: "/carrinho", label: "Revisar carrinho" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="space-y-4">
          <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[#1d1712]">Contato e endereço</h2>
            <p className="mt-2 text-sm text-muted">
              Campos estruturados para nome, telefone, e-mail e endereço completo.
            </p>
          </div>

          <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[#1d1712]">Frete por região</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {shippingOptions.map((option) => (
                <div key={option.region} className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-4">
                  <div className="text-sm font-semibold text-[#1e1713]">{option.region}</div>
                  <div className="mt-1 text-sm text-muted">{formatCurrencyBRL(option.value)}</div>
                </div>
              ))}
            </div>
          </div>

          <div id="pagamento" className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[#1d1712]">Pagamento</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <article className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-4">
                <p className="text-sm font-semibold text-[#1e1713]">Pix</p>
                <p className="mt-2 text-sm text-muted">Fluxo pronto para instruções e webhook de confirmação.</p>
              </article>
              <article className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-4">
                <p className="text-sm font-semibold text-[#1e1713]">Cartão</p>
                <p className="mt-2 text-sm text-muted">Fluxo preparado para aprovação, pendência e recusa.</p>
              </article>
            </div>
          </div>
        </section>

        <aside className="surface-strong h-fit rounded-[28px] border border-[color:var(--border)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Resumo</p>
          <div className="mt-4 space-y-4">
            {featuredProducts.slice(0, 1).map((item) => (
              <div key={item.slug} className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1e1713]">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted">1 unidade</p>
                  </div>
                  <span className="text-sm font-semibold text-[#1e1713]">{formatCurrencyBRL(item.priceCents)}</span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/75 px-4 py-3 text-sm font-semibold text-[#3a281c] transition hover:bg-white"
          >
            Ajustar itens antes de pagar
          </Link>
        </aside>
      </div>
    </PublicPage>
  );
}
