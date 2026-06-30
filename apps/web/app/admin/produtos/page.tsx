import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminProductStatusControl } from "../../../components/admin-product-status-control";
import { getAdminAuthMe, getAdminProducts } from "../../../lib/storefront-api";
import { formatCurrencyBRL } from "../../../lib/format";

function formatStock(available: number, reserved: number) {
  return `${available} disponíveis, ${reserved} reservados`;
}

export default async function AdminProdutosPage() {
  const cookieHeader = cookies().toString();
  const session = await getAdminAuthMe(cookieHeader);

  if (!session?.authenticated) {
    redirect("/admin/login");
  }

  const products = await getAdminProducts(cookieHeader);

  return (
    <main className="page-shell min-h-screen px-6 py-8 sm:py-12">
      <section className="surface overflow-hidden rounded-[36px]">
        <div className="grid-dots border-b border-[color:var(--border)] px-6 py-10 sm:px-10 sm:py-14">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Admin / Produtos</p>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#191310] sm:text-5xl">
              Catálogo e ativação
            </h1>
            <p className="max-w-2xl text-base text-muted sm:text-lg">
              Base operacional para ligar e desligar produtos enquanto o CRUD completo segue para a próxima fatia.
            </p>
            <p className="text-sm text-muted">Autenticado como {session.email}</p>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          {products && products.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {products.map((product) => (
                <article key={product.id} className="surface-strong rounded-[28px] border border-[color:var(--border)] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#896139]">
                        {product.active ? "Ativo" : "Inativo"}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#1d1712]">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-sm text-muted">{product.slug}</p>
                    </div>
                    <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-sm font-semibold accent-text">
                      {formatCurrencyBRL(product.priceCents)}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-muted">{product.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.categories.map((category) => (
                      <span
                        key={category.id}
                        className="rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1 text-xs font-medium text-[#3a281c]"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 text-sm text-[#32251c]">
                    {product.stock
                      ? formatStock(product.stock.availableQuantity, product.stock.reservedQuantity)
                      : "Sem estoque cadastrado"}
                  </div>

                  <div className="mt-5">
                    <AdminProductStatusControl productId={product.id} currentActive={product.active} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-[color:var(--border)] bg-white/70 p-6 text-sm text-muted">
              Nenhum produto encontrado.
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/admin"
              className="inline-flex rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/75 px-5 py-3 text-sm font-semibold text-[#3a281c] transition hover:bg-white"
            >
              Voltar ao admin
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
