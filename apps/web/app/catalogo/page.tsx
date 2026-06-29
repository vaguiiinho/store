import Link from "next/link";
import { PublicPage } from "../../components/public-page";
import { featuredProducts } from "../../lib/storefront-content";
import { formatCurrencyBRL } from "../../lib/format";

export default function CatalogoPage() {
  return (
    <PublicPage
      eyebrow="Catálogo"
      title="Seleção inicial pensada para navegação rápida e decisão simples."
      description="A listagem já deixa claro o que entra no carrinho, o que abre o detalhe do produto e o que ajuda a testar o fluxo de compra."
      primaryAction={{ href: "/carrinho", label: "Ir para carrinho" }}
      secondaryAction={{ href: "/", label: "Voltar para início" }}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {featuredProducts.map((product) => (
          <article key={product.slug} className="surface-strong rounded-[28px] border border-[color:var(--border)] p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] accent-text">
                {product.badge}
              </span>
              <span className="text-sm font-semibold text-[#241b17]">{formatCurrencyBRL(product.priceCents)}</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[#1c1511]">{product.name}</h2>
            <p className="mt-3 text-sm text-muted">{product.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-[#33251b]">
              {product.details.map((detail) => (
                <li key={detail} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#8b5a2b]" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/produto/${product.slug}`}
              className="mt-5 inline-flex rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/80 px-4 py-2 text-sm font-semibold text-[#3a281c] transition hover:bg-white"
            >
              Abrir detalhe
            </Link>
          </article>
        ))}
      </div>
    </PublicPage>
  );
}
