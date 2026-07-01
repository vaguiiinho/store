import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "../../../components/add-to-cart-button";
import { PublicPage } from "../../../components/public-page";
import { getFeaturedProduct } from "../../../lib/storefront-api";
import { formatCurrencyBRL } from "../../../lib/format";

export const dynamic = "force-dynamic";

type ProdutoPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = await params;
  const product = await getFeaturedProduct(slug);

  if (!product) {
    notFound();
  }

  const availableQuantity = product?.stock?.availableQuantity ?? null;
  const reservedQuantity = product?.stock?.reservedQuantity ?? null;

  return (
    <PublicPage
      eyebrow="Produto"
      title={product?.name ?? "Produto em destaque"}
      description={
        product?.description ??
        "O detalhe do produto já prepara a página para exibir imagem, preço, variações e acesso ao carrinho."
      }
      primaryAction={product ? undefined : { href: "/carrinho", label: "Ir ao carrinho" }}
      secondaryAction={{ href: "/catalogo", label: "Voltar ao catálogo" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
          {product?.images?.[0] ? (
            <div className="overflow-hidden rounded-[24px] border border-[color:rgba(124,79,36,0.22)] bg-white/80">
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full max-h-[520px] w-full object-cover"
              />
            </div>
          ) : (
            <div className="grid h-full min-h-[320px] place-items-center rounded-[24px] border border-dashed border-[color:rgba(124,79,36,0.28)] bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(245,231,208,0.68))] p-6">
              <div className="max-w-sm text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Imagem do produto</p>
                <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#1d1712]">
                  Espaço preparado para Cloudinary e galeria
                </p>
                <p className="mt-3 text-sm text-muted">
                  Este bloco substitui o placeholder por uma estrutura real para imagem principal, variações e zoom.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Preço</p>
            <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#1d1712]">
              {formatCurrencyBRL(product?.priceCents ?? 0)}
            </div>
            <p className="mt-3 text-sm text-muted">
              {product
                ? "Produto pronto para entrar no carrinho e seguir para o checkout."
                : `Slug atual: ${slug}.`}
            </p>
          </section>

          {product ? (
            <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Estoque mock</p>
              <div className="mt-3 space-y-2 text-sm text-[#32251c]">
                <p>{availableQuantity !== null ? `${availableQuantity} unidade(s) disponível(is)` : "Estoque não informado"}</p>
                {reservedQuantity !== null ? <p>{reservedQuantity} unidade(s) reservada(s)</p> : null}
              </div>
            </section>
          ) : null}

          {product ? (
            <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Ação rápida</p>
              <p className="mt-3 text-sm text-muted">
                Use o botão abaixo para adicionar este item ao carrinho local e continuar a simulação da compra.
              </p>
              <div className="mt-5">
                <AddToCartButton product={product} />
              </div>
            </section>
          ) : null}

          {product ? (
            <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Resumo do catálogo</p>
              <ul className="mt-4 space-y-3 text-sm text-[#32251c]">
                {product.details.slice(0, 4).map((detail) => (
                  <li key={detail} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#8b5a2b]" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {product?.variants?.length ? (
            <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Variações</p>
              <div className="mt-4 space-y-3">
                {product.variants.map((variant) => (
                  <div key={`${variant.name}-${variant.value}`} className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-4">
                    <div className="text-sm font-semibold text-[#1e1713]">{variant.name}</div>
                    <p className="mt-2 text-sm text-muted">{variant.value}</p>
                    {variant.sku ? <p className="mt-1 text-xs text-muted">SKU mock: {variant.sku}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Próximos campos</p>
            <ul className="mt-4 space-y-3 text-sm text-[#32251c]">
                <li>Seleção de variantes e disponibilidade.</li>
                <li>Controles de quantidade com validação de estoque.</li>
                <li>Resumo do frete fixo por região.</li>
              </ul>
              <Link
                href="/checkout"
                className="mt-5 inline-flex rounded-full bg-[#1d1712] px-4 py-2 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d]"
              >
              Seguir para checkout
            </Link>
          </section>
        </aside>
      </div>
    </PublicPage>
  );
}
