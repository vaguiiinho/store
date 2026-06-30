import Link from "next/link";
import { PublicPage } from "../components/public-page";
import { storePillars, storefrontStats } from "../lib/storefront-content";
import { getFeaturedProducts } from "../lib/storefront-api";
import { formatCurrencyBRL } from "../lib/format";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <PublicPage
      eyebrow="Demo principal"
      title="Uma loja física pronta para apresentação, com vitrine, carrinho e checkout visitante."
      description="A base da v1 já conta a jornada completa: descoberta do produto, resumo do pedido e confirmação com pagamento simulado."
      primaryAction={{ href: "/catalogo", label: "Abrir catálogo" }}
      secondaryAction={{ href: "/checkout", label: "Ir para checkout" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {storefrontStats.map((stat) => (
              <div key={stat.label} className="surface-strong rounded-3xl border border-[color:var(--border)] p-5">
                <div className="text-2xl font-semibold tracking-[-0.04em] text-[#1f1814]">{stat.value}</div>
                <div className="mt-2 text-sm text-muted">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {storePillars.map((pillar) => (
              <article key={pillar.title} className="surface-strong rounded-3xl border border-[color:var(--border)] p-5">
                <h2 className="text-base font-semibold text-[#201813]">{pillar.title}</h2>
                <p className="mt-3 text-sm text-muted">{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="surface-strong rounded-[32px] border border-[color:var(--border)] p-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Produtos em destaque</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1c1511]">
                Itens curados para mostrar o fluxo completo
              </h2>
            </div>

            <div className="space-y-4">
              {featuredProducts.map((product) => (
                <article key={product.slug} className="rounded-3xl border border-[color:var(--border)] bg-white/75 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] accent-text">
                      {product.badge}
                    </span>
                    <span className="text-sm font-semibold text-[#241b17]">
                      {formatCurrencyBRL(product.priceCents)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#1f1713]">{product.name}</h3>
                  <p className="mt-2 text-sm text-muted">{product.description}</p>
                  <Link
                    href={`/produto/${product.slug}`}
                    className="mt-4 inline-flex text-sm font-semibold accent-text transition hover:text-[#5f3719]"
                  >
                    Abrir detalhe do produto
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PublicPage>
  );
}
