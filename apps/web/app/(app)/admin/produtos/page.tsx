import Link from "next/link";
import { cookies } from "next/headers";
import { PageHeader } from "../../../../components/page-header";
import { requireAdmin } from "../../../../lib/session";
import { AdminProductStatusControl } from "../../../../components/admin-product-status-control";
import { getAdminProducts } from "../../../../lib/storefront-api";
import { formatCurrencyBRL } from "../../../../lib/format";
import { AdminProductInventoryControl } from "../../../../components/admin-product-inventory-control";

function formatStock(available: number, reserved: number, unit: string) {
  return `${available} ${unit} disponível, ${reserved} ${unit} reservado`;
}

export default async function AdminProdutosPage() {
  const cookieHeader = (await cookies()).toString();
  await requireAdmin();

  const products = await getAdminProducts(cookieHeader);

  return (
    <>
      <PageHeader
        title="Produtos"
        actions={
          <Link
            href="/admin/produtos/novo"
            className="inline-flex rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d]"
          >
            Novo produto
          </Link>
        }
      />
      <div>
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

                  <p className="mt-4 text-sm leading-6 text-muted">{product.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1 text-xs font-medium text-[#3a281c]">
                      {product.category.name}
                    </span>
                  </div>

                  <div className="mt-4 text-sm leading-6 text-[#32251c]">
                    {product.stock
                      ? formatStock(product.stock.availableQuantity, product.stock.reservedQuantity, product.stock.unit.abbreviation)
                      : "Sem estoque cadastrado"}
                  </div>

                  <div className="mt-5">
                    <AdminProductStatusControl productId={product.id} currentActive={product.active} />
                  </div>

                  <div className="mt-3"><AdminProductInventoryControl productId={product.id} /></div>

                  <div className="mt-4">
                    <Link
                      href={`/admin/produtos/${product.id}`}
                      className="inline-flex rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/75 px-4 py-2 text-sm font-semibold text-[#3a281c] transition hover:bg-white"
                    >
                      Editar produto
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-[color:var(--border)] bg-white/70 p-6 text-sm text-muted">
              Nenhum produto encontrado.
            </div>
          )}
      </div>
    </>
  );
}
