import { notFound } from "next/navigation";
import { AddToCartButton } from "../../../../components/add-to-cart-button";
import { PageHeader } from "../../../../components/page-header";
import { getFeaturedProduct } from "../../../../lib/storefront-api";
import { formatCurrencyBRL } from "../../../../lib/format";

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

  const availableQuantity = product.stock?.availableQuantity ?? null;

  return (
    <>
      <PageHeader title={product.name} />
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-strong overflow-hidden rounded-[30px] border border-[color:var(--border)]">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="h-full max-h-[640px] w-full object-cover" />
          ) : (
            <div className="grid-dots aspect-[4/3] w-full" />
          )}
        </section>

        <aside className="space-y-4">
          <section className="surface-strong space-y-4 rounded-[28px] border border-[color:var(--border)] p-6">
            <p className="text-3xl font-semibold tabular-nums">{formatCurrencyBRL(product.priceCents)}</p>
            <p className="text-sm text-muted">
              {availableQuantity === null ? "Disponibilidade sob consulta" : availableQuantity > 0 ? "Disponível" : "Sem estoque"}
            </p>
            <AddToCartButton product={product} />
          </section>

          <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <h2 className="text-lg font-semibold">Descrição</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{product.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.categories.map((category) => (
                <span key={category.slug} className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold">
                  {category.name}
                </span>
              ))}
            </div>
          </section>

          {product.variants?.length ? (
            <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
              <h2 className="text-lg font-semibold">Variações</h2>
              <ul className="mt-4 space-y-3">
                {product.variants.map((variant) => (
                  <li key={`${variant.name}-${variant.value}`} className="rounded-2xl border border-[color:var(--border)] p-4 text-sm">
                    <span className="font-semibold">{variant.name}</span>: {variant.value}
                    {variant.sku ? <span className="block text-xs text-muted">SKU: {variant.sku}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </>
  );
}
