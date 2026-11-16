import { PageHeader } from "../../../../../components/page-header";
import { requireAdmin } from "../../../../../lib/session";
import { AdminProductForm } from "../../../../../components/admin-product-form";
import { getCategories } from "../../../../../lib/storefront-api";

export default async function AdminNovoProdutoPage() {
  await requireAdmin();

  const categories = await getCategories();

  return (
    <>
      <PageHeader title="Criar produto" />
          {categories && categories.length > 0 ? (
            <div className="rounded-[28px] border border-[color:var(--border)] bg-white/80 p-6">
              <AdminProductForm mode="create" categories={categories} />
            </div>
          ) : (
            <div className="rounded-[28px] border border-[color:var(--border)] bg-white/70 p-6 text-sm text-muted">
              Nenhuma categoria ativa disponível para criar produto.
            </div>
          )}
    </>
  );
}
