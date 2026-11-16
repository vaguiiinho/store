import Link from "next/link";
import { PageHeader } from "../../components/page-header";
import { ProductCard } from "../../components/product-card";
import { getFeaturedProducts } from "../../lib/storefront-api";

type HomePageProps = {
  searchParams: Promise<{ q?: string; categoria?: string }>;
};

const inputClass =
  "w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]";
const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const products = await getFeaturedProducts();
  const rawQuery = params.q?.trim() ?? "";
  const query = rawQuery.toLowerCase();
  const selectedCategory = params.categoria?.trim() ?? "";

  const categories = Array.from(
    new Map(products.flatMap((product) => product.categories.map((category) => [category.slug, category] as const))).values()
  );

  const filtered = products.filter((product) => {
    const matchesQuery =
      query.length === 0 ||
      [product.name, product.description, product.badge, ...product.details, ...product.categories.map((category) => category.name)]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesCategory = selectedCategory.length === 0 || product.categories.some((category) => category.slug === selectedCategory);
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Loja" />

      <form method="get" role="search" className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Buscar produto</span>
          <input type="search" name="q" defaultValue={rawQuery} placeholder="Buscar produto" className={inputClass} />
        </label>
        {selectedCategory ? <input type="hidden" name="categoria" value={selectedCategory} /> : null}
        <button type="submit" className={primaryButton}>
          Buscar
        </button>
      </form>

      <nav aria-label="Categorias" className="flex flex-wrap gap-2">
        {[{ slug: "", name: "Todos" }, ...categories].map((category) => {
          const active = category.slug === selectedCategory;
          const search = new URLSearchParams();
          if (rawQuery) search.set("q", rawQuery);
          if (category.slug) search.set("categoria", category.slug);
          const qs = search.toString();
          return (
            <Link
              key={category.slug || "todos"}
              href={qs ? `/?${qs}` : "/"}
              aria-current={active ? "true" : undefined}
              className={`rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
                active
                  ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] font-semibold"
                  : "border-[color:var(--border)] text-muted hover:text-[color:var(--foreground)]"
              }`}
            >
              {category.name}
            </Link>
          );
        })}
      </nav>

      {filtered.length === 0 ? (
        <div className="surface rounded-[28px] p-8 text-center">
          <p className="font-semibold">Nenhum produto encontrado</p>
          <Link href="/" className="mt-3 inline-block text-sm font-semibold underline">
            Limpar filtros
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
