import Link from "next/link";
import { AddToCartButton } from "../../components/add-to-cart-button";
import { PublicPage } from "../../components/public-page";
import { getFeaturedProducts } from "../../lib/storefront-api";
import { formatCurrencyBRL } from "../../lib/format";

type CatalogoPageProps = {
  searchParams?: {
    q?: string;
    categoria?: string;
  };
};

function normalizeSearch(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const featuredProducts = await getFeaturedProducts();
  const query = normalizeSearch(searchParams?.q);
  const selectedCategory = searchParams?.categoria?.trim() ?? "";

  const categories = Array.from(
    new Map(
      featuredProducts.flatMap((product) =>
        product.categories.map((category) => [category.slug, category] as const)
      )
    ).values()
  );

  const filteredProducts = featuredProducts.filter((product) => {
    const matchesQuery =
      query.length === 0 ||
      [product.name, product.description, product.badge, ...product.details, ...product.categories.map((category) => category.name)]
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesCategory =
      selectedCategory.length === 0 ||
      product.categories.some((category) => category.slug === selectedCategory);

    return matchesQuery && matchesCategory;
  });

  return (
    <PublicPage
      eyebrow="Catálogo"
      title="Seleção curada para comparar rápido e entrar no detalhe sem ruído."
      description="O catálogo foi desenhado para mostrar imagem, contexto e ação principal com uma leitura mais elegante."
      primaryAction={{ href: "/carrinho", label: "Ir para carrinho" }}
      secondaryAction={{ href: "/", label: "Voltar para início" }}
    >
      <div className="space-y-6">
        <form method="get" className="surface-strong rounded-[28px] border border-[color:var(--border)] p-5">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr_auto]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Buscar produto</span>
              <input
                type="search"
                name="q"
                defaultValue={searchParams?.q ?? ""}
                placeholder="Nome, categoria, benefício ou ocasião"
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Categoria</span>
              <select
                name="categoria"
                defaultValue={selectedCategory}
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white/85 px-4 py-3 text-sm text-[#1d1712] outline-none transition focus:border-[color:rgba(124,79,36,0.45)]"
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d]"
              >
                Filtrar
              </button>
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/75 px-5 py-3 text-sm font-semibold text-[#3a281c] transition hover:bg-white"
              >
                Limpar
              </Link>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">
            {filteredProducts.length} produto(s) encontrados com os filtros atuais.
          </p>
        </form>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-semibold text-[#1d1712]">Atalhos:</span>
          <Link
            href="/catalogo"
            className="rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1.5 text-sm font-medium text-[#33271d] transition hover:bg-white"
          >
            Todos
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/catalogo?categoria=${category.slug}`}
              className="rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1.5 text-sm font-medium text-[#33271d] transition hover:bg-white"
            >
              {category.name}
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6 text-sm text-muted">
            Nenhum produto encontrado com os filtros atuais. Tente limpar a busca ou trocar a categoria.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.slug}
                className="overflow-hidden surface-strong rounded-[28px] border border-[color:var(--border)]"
              >
                {product.images?.[0] ? (
                  <div className="h-52 overflow-hidden bg-[#f2e8db]">
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] accent-text">
                      {product.badge}
                    </span>
                    <span className="text-sm font-semibold text-[#241b17]">{formatCurrencyBRL(product.priceCents)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#1c1511]">{product.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">{product.description}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-[#33251b]">
                    {product.details.slice(0, 4).map((detail) => (
                      <li key={detail} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#8b5a2b]" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/produto/${product.slug}`}
                      className="inline-flex rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/80 px-4 py-2 text-sm font-semibold text-[#3a281c] transition hover:bg-white"
                    >
                      Ver detalhe
                    </Link>
                    <AddToCartButton product={product} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PublicPage>
  );
}
