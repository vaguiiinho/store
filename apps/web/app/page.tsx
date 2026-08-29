import Link from "next/link";
import { PublicPage } from "../components/public-page";
import { storePillars, storefrontStats } from "../lib/storefront-content";
import { getFeaturedProducts } from "../lib/storefront-api";
import { formatCurrencyBRL } from "../lib/format";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <PublicPage
      eyebrow="Loja online"
      title="Uma vitrine de loja com presença visual, fluxo claro e checkout visitante."
      description="Encontre produtos, adicione ao carrinho e finalize sua compra em poucos passos."
      showHighlights
    >
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {storefrontStats.map((stat) => (
              <div key={stat.label} className="surface-strong rounded-[28px] border border-[color:var(--border)] p-5">
                <div className="text-2xl font-semibold tracking-[-0.05em] text-[#1f1814]">{stat.value}</div>
                <div className="mt-2 text-sm leading-6 text-muted">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {storePillars.map((pillar) => (
              <article key={pillar.title} className="surface-strong rounded-[28px] border border-[color:var(--border)] p-5">
                <h2 className="text-base font-semibold text-[#201813]">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>

        <section className="surface-strong rounded-[32px] border border-[color:var(--border)] p-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Produtos em destaque</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#1c1511]">
                Uma seleção curada para apresentar a loja com rapidez
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <article key={product.slug} className="overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-white/75">
                  {product.images?.[0] ? (
                    <div className="h-48 overflow-hidden">
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] accent-text">
                        {product.badge}
                      </span>
                      <span className="text-sm font-semibold text-[#241b17]">
                        {formatCurrencyBRL(product.priceCents)}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#1f1713]">{product.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{product.description}</p>
                    <Link
                      href={`/produto/${product.slug}`}
                      className="mt-4 inline-flex text-sm font-semibold accent-text transition hover:text-[#5f3719]"
                    >
                      Abrir detalhe do produto
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PublicPage>
  );
}
