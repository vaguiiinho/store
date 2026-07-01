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
        "Uma página de produto pensada para leitura rápida, decisão visual e entrada direta no carrinho."
      }
      primaryAction={product ? undefined : { href: "/carrinho", label: "Ir ao carrinho" }}
      secondaryAction={{ href: "/catalogo", label: "Voltar ao catálogo" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="surface-strong overflow-hidden rounded-[30px] border border-[color:var(--border)]">
            {product?.images?.[0] ? (
              <div className="relative">
                <div className="absolute left-5 top-5 z-10 rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#6e4a29] backdrop-blur">
                  Produto em destaque
                </div>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full max-h-[640px] w-full object-cover"
                />
              </div>
            ) : (
              <div className="grid min-h-[420px] place-items-center bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(245,231,208,0.68))] p-8">
                <div className="max-w-sm text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Imagem do produto</p>
                  <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#1d1712]">
                    Espaço preparado para Cloudinary e galeria
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    Este bloco foi desenhado para receber imagem principal, zoom e variações sem mudar a estrutura.
                  </p>
                </div>
              </div>
            )}
          </section>

          {product ? (
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="surface-strong rounded-[24px] border border-[color:var(--border)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#896139]">Preço</p>
                <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#1d1712]">
                  {formatCurrencyBRL(product.priceCents)}
                </div>
              </div>
              <div className="surface-strong rounded-[24px] border border-[color:var(--border)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#896139]">Estoque</p>
                <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#1d1712]">
                  {availableQuantity !== null ? availableQuantity : "—"}
                </div>
              </div>
              <div className="surface-strong rounded-[24px] border border-[color:var(--border)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#896139]">Reserva</p>
                <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#1d1712]">
                  {reservedQuantity !== null ? reservedQuantity : "—"}
                </div>
              </div>
            </section>
          ) : null}

          {product ? (
            <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Descrição</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{product.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <span
                    key={category.slug}
                    className="rounded-full border border-[color:rgba(124,79,36,0.18)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#6e4a29]"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          {product ? (
            <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Ação rápida</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Adicione este item ao carrinho e siga para a jornada de compra em poucos passos.
              </p>
              <div className="mt-5">
                <AddToCartButton product={product} />
              </div>
            </section>
          ) : null}

          {product ? (
            <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Resumo</p>
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
                    <p className="mt-2 text-sm leading-6 text-muted">{variant.value}</p>
                    {variant.sku ? <p className="mt-1 text-xs text-muted">SKU mock: {variant.sku}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Próximos campos</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#32251c]">
              <li>Seleção de variantes e disponibilidade em tempo real.</li>
              <li>Controles de quantidade com validação de estoque.</li>
              <li>Resumo de frete e checkout integrados ao fluxo da loja.</li>
            </ul>
            <Link
              href="/checkout"
              className="mt-5 inline-flex rounded-full bg-[#1d1712] px-4 py-2 text-sm font-semibold text-[#fffaf2] shadow-[0_10px_24px_rgba(29,23,18,0.16)] transition hover:bg-[#34261d]"
            >
              Seguir para checkout
            </Link>
          </section>
        </aside>
      </div>
    </PublicPage>
  );
}
