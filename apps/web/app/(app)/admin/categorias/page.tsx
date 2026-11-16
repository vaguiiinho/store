import { cookies } from "next/headers";
import { PageHeader } from "../../../../components/page-header";
import { StatError } from "../../../../components/stat-card";
import { AdminCategoryForm } from "../../../../components/admin-category-form";
import { AdminCategoryActions } from "../../../../components/admin-category-actions";
import { TagIcon } from "../../../../components/icons";
import { requireAdmin } from "../../../../lib/session";
import { getAdminCategories } from "../../../../lib/storefront-api";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const items = await getAdminCategories((await cookies()).toString());

  if (!items) {
    return (
      <>
        <PageHeader title="Categorias" />
        <StatError label="as categorias" />
      </>
    );
  }

  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <>
      <PageHeader title="Categorias" />
      <div className="space-y-6">
        <AdminCategoryForm />
        {sorted.length === 0 ? (
          <div className="surface rounded-[24px] p-8 text-center">
            <TagIcon className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3 font-semibold">Nenhuma categoria cadastrada</p>
            <p className="mt-1 text-sm text-muted">Crie uma categoria acima para classificar seus produtos.</p>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Categorias">
            {sorted.map((item) => (
              <AdminCategoryActions key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
