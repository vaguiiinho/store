import Link from "next/link";
import { AddToCartButton } from "./add-to-cart-button";
import { formatCurrencyBRL } from "../lib/format";
import type { FeaturedProduct } from "../lib/storefront-content";

export function ProductCard({ product }: { product: FeaturedProduct }) {
  const available = product.stock?.availableQuantity ?? null;
  const soldOut = available !== null && available <= 0;

  return (
    <article className="surface group flex flex-col overflow-hidden rounded-[28px] transition hover:border-[color:rgba(124,79,36,0.34)]">
      <Link
        href={`/produto/${product.slug}`}
        aria-label={product.name}
        tabIndex={-1}
        className="relative block aspect-[4/3] overflow-hidden bg-[color:var(--accent-soft)]"
      >
        {product.images?.[0] ? (
          <img src={product.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="grid-dots h-full w-full" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-strong)]">
          {product.badge}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link
          href={`/produto/${product.slug}`}
          className="line-clamp-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold tabular-nums">{formatCurrencyBRL(product.priceCents)}</p>
            {soldOut ? <p className="text-xs font-semibold text-[color:var(--danger)]">Sem estoque</p> : null}
          </div>
          <AddToCartButton product={product} variant="icon" />
        </div>
      </div>
    </article>
  );
}
